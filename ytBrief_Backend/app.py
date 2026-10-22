import os
import uuid
from datetime import datetime, timezone

from flask import Flask, request, jsonify
from flask_cors import CORS
from scrape_yt import extractVidID, transcript, get_transcript_info
from summarize_text import generate_summary_with_gemini, get_video_statistics
from structured_summary import generate_structured_summary, SummaryError
from chapters import get_chapters
import store

app = Flask(__name__)
# Set CORS_ORIGINS="http://localhost:3000,https://your-app.vercel.app" in production
CORS(app, origins=os.getenv("CORS_ORIGINS", "*").split(","))
store.init()

LANGS = {"en", "es", "fr"}
TYPES = {"quick", "detailed", "key-points", "chapters"}
TRANSCRIPT_FAIL_PREFIXES = (
    "Error", "No ", "Transcript", "Video is unavailable", "Too many", "Failed", "YouTube request failed",
)


def api_error(code, status, message=None):
    """Error body the Next.js client understands: {code, error}."""
    return jsonify({"code": code, "error": message or code}), status


def build_video_meta(video_id):
    title, stats, thumbnail = get_video_statistics(video_id)
    if not stats:  # get_video_statistics signals failure with an empty stats dict
        raise LookupError(title)
    return {
        "id": video_id,
        "title": title,
        "channel": stats.get("Channel", ""),
        "duration": stats.get("Duration", ""),
        "views": stats.get("Views", ""),
        "thumbnail": thumbnail,
        "url": f"https://www.youtube.com/watch?v={video_id}",
        "chapters": get_chapters(video_id),
    }


def meta_or_error(url):
    """Returns (meta, None) or (None, error_response)."""
    try:
        video_id = extractVidID(url)
    except ValueError:
        return None, api_error("invalid_url", 400)
    try:
        return build_video_meta(video_id), None
    except LookupError as e:
        code = "video_unavailable" if "not found" in str(e).lower() else "api_error"
        return None, api_error(code, 404 if code == "video_unavailable" else 502, str(e))


# ---------- Routes used by the Next.js UI ----------

@app.route('/api/video-meta', methods=['POST'])
def video_meta():
    """Cheap preview (YouTube stats only; no transcript, no Gemini call)."""
    data = request.get_json(silent=True) or {}
    meta, err = meta_or_error(data.get('url', ''))
    return err if err else jsonify(meta)


@app.route('/api/summarize', methods=['POST'])
def summarize():
    data = request.get_json(silent=True) or {}
    language = data.get('language', 'en')
    summary_type = data.get('type', 'quick')
    chapters = data.get('chapters', 'all')
    if language not in LANGS or summary_type not in TYPES:
        return api_error("api_error", 400, "Unsupported language or summary type")

    meta, err = meta_or_error(data.get('url', ''))
    if err:
        return err

    text = transcript(meta['id'])
    if text.startswith(TRANSCRIPT_FAIL_PREFIXES):
        code = "video_unavailable" if text.startswith("Video is unavailable") else "transcript_unavailable"
        return api_error(code, 404 if code == "video_unavailable" else 422, text)

    available = meta['chapters']
    if isinstance(chapters, list):
        chosen = [available[i]['title'] for i in chapters if isinstance(i, int) and 0 <= i < len(available)]
    else:
        chosen = [c['title'] for c in available]

    try:
        parts = generate_structured_summary(text, language, summary_type, chosen)
    except SummaryError as e:
        return api_error(e.code, 502, str(e))

    summary = {
        "id": uuid.uuid4().hex[:12],
        "video": meta,
        **parts,
        "language": language,
        "type": summary_type,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    store.save(summary)
    return jsonify(summary)


@app.route('/api/files', methods=['GET'])
def list_files():
    return jsonify(store.list_all())


@app.route('/api/files/<summary_id>', methods=['GET'])
def get_file(summary_id):
    s = store.get(summary_id)
    return jsonify(s) if s else api_error("api_error", 404, "Summary not found")


@app.route('/api/files/<summary_id>', methods=['DELETE'])
def delete_file(summary_id):
    # 200 + JSON body (not 204): the client always calls res.json() on success
    if not store.delete(summary_id):
        return api_error("api_error", 404, "Summary not found")
    return jsonify({"ok": True})


# ---------- Original routes (unchanged, still used by the old React UI) ----------

@app.route('/api/video-info', methods=['POST'])
def get_video_info():
    try:
        data = request.json
        video_url = data.get('url')
        
        if not video_url:
            return jsonify({'error': 'No URL provided'}), 400
            
        video_id = extractVidID(video_url)

        # Get video statistics
        title, stats, thumbnail = get_video_statistics(video_id)

        # Get transcript info (optional - for debugging/transparency)
        transcript_info = get_transcript_info(video_id)

        # Get transcript with enhanced error handling
        video_transcript = transcript(video_id)
        
        # Only generate summary if transcript was successfully retrieved
        if video_transcript and not video_transcript.startswith("Error") and not video_transcript.startswith("No") and not video_transcript.startswith("Transcripts"):
            summary = generate_summary_with_gemini(video_transcript)
        else:
            summary = "Summary unavailable - transcript could not be retrieved."

        return jsonify({
            'title': title,
            'stats': stats,
            'thumbnail': thumbnail,
            'summary': summary,
            'transcript_available': not video_transcript.startswith(("Error", "No", "Transcripts", "Failed")),
            'transcript_info': transcript_info,
            # Optional: include first 500 chars of transcript for preview
            'transcript_preview': video_transcript[:500] + "..." if len(video_transcript) > 500 else video_transcript
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transcript-info', methods=['POST'])
def get_transcript_details():
    """Endpoint to get detailed transcript information"""
    try:
        data = request.json
        video_url = data.get('url')
        
        if not video_url:
            return jsonify({'error': 'No URL provided'}), 400
            
        video_id = extractVidID(video_url)
        transcript_info = get_transcript_info(video_id)
        
        return jsonify(transcript_info)
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/full-transcript', methods=['POST'])
def get_full_transcript():
    """Endpoint to get the full transcript"""
    try:
        data = request.json
        video_url = data.get('url')
        
        if not video_url:
            return jsonify({'error': 'No URL provided'}), 400
            
        video_id = extractVidID(video_url)
        full_transcript = transcript(video_id)
        
        return jsonify({
            'transcript': full_transcript,
            'available': not full_transcript.startswith(("Error", "No", "Transcripts", "Failed"))
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)