from flask import Flask, request, jsonify
from flask_cors import CORS
from scrape_yt import extractVidID, transcript
from summarize_text import generate_summary_with_gemini, get_video_statistics

app = Flask(__name__)
CORS(app)

@app.route('/api/video-info', methods=['POST'])
def get_video_info():
    try:
        data = request.json
        video_url = data.get('url')
        video_id = extractVidID(video_url)

        #Get Vid Stats
        title, stats, thumbnail = get_video_statistics(video_id)

        #Get transcripts and generate summary
        video_transcript = transcript(video_id)
        summary = generate_summary_with_gemini(video_transcript)

        return jsonify({
            'title': title,
            'stats': stats,
            'thumbnail': thumbnail,
            'summary': summary,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)