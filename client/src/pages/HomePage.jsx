import { useState, useEffect } from "react";
import axios from 'axios';

const HomePage = () => {
    const [topSong, setTopSong] = useState(null);
    useEffect(() => {
        const fetchTopSong = async() => {
            try {
                const response = await axios.get("http://localhost:8080/topSongOfWeek");
                const data = response.data;
                setTopSong(data);
            } catch (error) {
                console.log('Error fetching data', error);
            } 
        };
        fetchTopSong();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-8">
            <div className="max-w-5xl w-full text-center">
                {topSong ? (
                    <div>
                         <h1 className=" text-3xl my-0 italic font-bold text-violet-300 font-body mb-0">
                            Remember This? {topSong.year}&apos;s #1 Song of this Week
                        </h1>
                        <div>
                            <p className=" font-title my-4 font-extrabold animate-pulse uppercase text-8xl">{topSong.track_name}</p>
                            <div className= "my-0 italic text-rose-300 text-lg flex font-body justify-center space-x-4">
                                <p>By {topSong.artists},</p>
                                <p>Album: {topSong.album}</p>
                            </div>
                        </div>
                    </div>
                ) : ( <div> </div>)}
            </div>
        </div>
    );
}

export default HomePage;
