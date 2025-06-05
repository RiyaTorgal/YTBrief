import { FaFilePdf } from "react-icons/fa6";

const Files = () => {
    return (
        <div className="flex-1 p-8">
            <h1 className="text-3xl font-bold mb-2">Files</h1>
            <p className="text-xl text_tone font-semibold mb-3">Your saved video summaries will appear here.</p>
            <div className='flex items-center justify-start mb-4'>
            <button className="bg-white rounded-lg border m-6 border-gray-200 p-6">
                <div>
                    <div className="p-3 rounded-md">
                        <FaFilePdf className='icon_tone'/>
                        <p className="font-semibold">Sample Video Summary.pdf</p>
                        <p className="text-sm text-gray-500">Created 2 hours ago</p>
                    </div>
                </div>
            </button>
            <button className="bg-white rounded-lg border m-6 border-gray-200 p-6">
                <div>
                    <div className="p-3 rounded-md">
                        <FaFilePdf className='icon_tone'/>
                        <p className="font-semibold">Tech Tutorial Summary.pdf</p>
                        <p className="text-sm text-gray-500">Created yesterday</p>
                    </div>
                </div>
            </button>
            </div>
        </div>
    )
}

export default Files;