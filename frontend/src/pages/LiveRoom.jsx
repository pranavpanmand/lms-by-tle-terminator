import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { StreamVideo, StreamVideoClient, StreamCall, StreamTheme, SpeakerLayout, CallControls, CallParticipantsList } from '@stream-io/video-react-sdk';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import axios from 'axios';
import { serverUrl } from '../App';
import { toast } from 'react-toastify';

export default function LiveRoom() {
  const { userData } = useSelector((state) => state.user);
  const { meetingId } = useParams(); // Passed via URL
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) return;

    const initCall = async () => {
      try {
        // 1. Get Token from Backend
        const { data } = await axios.get(`${serverUrl}/api/live/get-token`, { withCredentials: true });
        
        const user = {
          id: userData._id,
          name: userData.name,
          image: userData.photoUrl,
        };

        // 2. Setup Stream Client
        const myClient = new StreamVideoClient({ apiKey: data.apiKey, user, token: data.token });
        const myCall = myClient.call('default', meetingId);

        await myCall.join({ create: true });

        setClient(myClient);
        setCall(myCall);
      } catch (error) {
        console.error(error);
        toast.error("Failed to join live class");
        navigate(-1);
      }
    };

    initCall();

    return () => {
      if (client) client.disconnectUser();
    };
  }, [meetingId, userData]);

  if (!client || !call) return <div className="h-screen flex items-center justify-center text-white">Loading Class...</div>;

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <div className="flex h-screen w-screen bg-slate-900 overflow-hidden">
          
          {/* LEFT SIDE: WHITEBOARD (Larger Area) */}
          <div className="flex-1 border-r border-slate-700 relative">
             {/* Note: For real-time sync, teacher should 'Share Screen' this area via Stream Controls */}
             <Tldraw 
               hideUi={userData.role === 'student'} 
               readOnly={userData.role === 'student'}
             />
             {userData.role === 'student' && (
                <div className="absolute top-4 left-4 bg-black/60 p-2 rounded text-white text-xs z-50 pointer-events-none">
                    View Only Mode
                </div>
             )}
          </div>

          {/* RIGHT SIDE: VIDEO & CHAT (Smaller Area) */}
          <div className="w-[350px] flex flex-col bg-slate-800">
            <div className="flex-1 overflow-y-auto p-2">
               <SpeakerLayout participantsBarPosition="bottom" />
            </div>
            
            <div className="p-4 bg-slate-900 border-t border-slate-700">
              <CallControls 
                onLeave={() => navigate('/dashboard')} 
              />
            </div>
          </div>

        </div>
      </StreamCall>
    </StreamVideo>
  );
}