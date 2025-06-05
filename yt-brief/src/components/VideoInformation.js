import React from 'react';
import { BiSolidLike } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import { FaComments } from "react-icons/fa";
import { MdAccessTimeFilled } from "react-icons/md";
import { MdUpload } from "react-icons/md";
import { HiSpeakerWave } from "react-icons/hi2";
import BulletList from './BulletList';
import StatsRow from './StatsRow';

const VideoInformation = ({
  videoTitle,
  videoStats,
  thumbnailUrl,
  videoSummary,
  isSpeaking,
  isPaused,
  onDownloadPDF,  // Changed from handleDownloadPDF to onDownloadPDF
  onReadAloud,    // Changed from readAloud to onReadAloud
  onTogglePause,  // Changed from togglePauseSpeech to onTogglePause
}) => {
    return(
        <>
            <h1 className="text-3xl font-bold mb-4">Video Information:</h1>
            <div className="flex mb-6">
              <div className="flex-1">
                <img src={thumbnailUrl || "https://placehold.co/1280x720"} alt="Video Thumbnail" className="rounded-md" />
              </div>

              <div className="flex-1 ml-6 mt-6">
                <h1 className="text-3xl font-bold mb-4">Video Stats:</h1>
                <div className="space-y-2">
                  <StatsRow icon={<BiSolidLike className='icon_tone'/>} label="Likes" value={videoStats.Likes} />
                  <StatsRow icon={<FaEye className='icon_tone'/>} label="Views" value={videoStats.Views} />
                  <StatsRow icon={<FaComments className='icon_tone'/>} label="Comments" value={videoStats.Comments} />
                  <StatsRow icon={<MdAccessTimeFilled className='icon_tone'/>} label="Duration" value={videoStats.Duration} />
                  <StatsRow icon={<MdUpload className='icon_tone'/>} label="Published" value={videoStats.publishedDate} />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-1">{videoTitle}</h1>
              <h2 className="text-gray-600 font-semibold text_tone text-2xl mb-4">Channel: {videoStats.Channel}</h2>
              
              <div className='border border-slate-300 rounded-lg shadow-md p-5'>
                <div className="flex mt-1 justify-between items-center mb-4">
                  <h2 className="text-3xl font-bold">Video Summary</h2>
                  <div className="flex p-2">
                    <button 
                      onClick={onReadAloud}
                      className="flex items-center px-4 py-2 hover:bg-red-600 text-red-600 hover:text-white border border-red-600 hover:border-transparent rounded-md transition">
                      <HiSpeakerWave className='text-xl flex mr-3'/>
                      {isSpeaking ? 'Stop' : 'Read Out Loud'}
                    </button>
                    {isSpeaking && (
                      <button 
                        onClick={onTogglePause}
                        className="flex ml-4 items-center px-4 py-2 hover:bg-red-600 text-red-600 hover:text-white border border-red-600 hover:border-transparent rounded-md transition">
                        {isPaused ? 'Play' : 'Pause'}
                      </button>
                    )}
                    <button 
                      onClick={onDownloadPDF}
                      className="flex ml-4 items-center px-4 py-2 hover:bg-red-600 text-red-600 hover:text-white border border-red-600 hover:border-transparent rounded-md transition"
                    >
                      Download Summary as PDF
                    </button>
                  </div>
                </div>
                <div className="space-y-4 font-semibold text_tone">
                  <BulletList items={videoSummary.mainTopics} title="Main Topics and Key Points" />
                  <BulletList items={videoSummary.insights} title="Important Insights" />
                  <BulletList items={videoSummary.conclusions} title="Core Conclusions" />
                </div>
              </div>
            </div>
        </>
    )
}

export default VideoInformation;