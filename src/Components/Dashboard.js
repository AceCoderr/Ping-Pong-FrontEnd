import React, { useState, useEffect, use } from 'react';
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import '../Styles/Dashboard.css';

function Dashboard({ setCurrentRoom, setUsername }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [joinUsername, setJoinUsername] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [username, setLoginUsername] = useState("");
  const [password, setPassword] = useState("");
  
  const navigate = useNavigate();

  // Fetch available rooms
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    const loginData = {
      username,
      password
    }
    setLoginUsername('user')
    setPassword('2e69cb6c-1605-48d6-abb7-2217bdf873b1')
    
    try {
      const response = await axios.get('http://localhost:8080/fetchRooms', {
        params: loginData
      });
      
      if (response.status !== 200) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      // Transform the array of IDs into room objects
      const roomIds = response.data;
      const formattedRooms = roomIds.map(id => ({
        id: id,
        name: `Room ${id.substring(0, 6)}...`, // Create a shortened display name
        participants: Math.floor(Math.random() * 10) + 1 // Random number for demo
      }));
      
      setRooms(formattedRooms);
      
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError('Failed to load rooms. Please try again later.');
      // For demo, create dummy data
      setRooms([
        { id: '1', name: 'General Chat', participants: 5 },
        { id: '2', name: 'Tech Discussion', participants: 3 },
        { id: '3', name: 'Coffee Break', participants: 2 },
        { id: '4', name: 'Project Alpha', participants: 8 },
        { id: '5', name: 'Random Talk', participants: 4 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!newRoomName || !createUsername) return;
    
    setLoading(true);
    const loginData = {
      username,
      password
    }
    setLoginUsername('user')
    setPassword('2e69cb6c-1605-48d6-abb7-2217bdf873b1')
    try {
      //API call
      const response = await axios.post('http://localhost:8080/create',loginData);

      if (response.status !== 200) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      console.log(response)
    //Parse the JSON response
    const data = response.data;
    let guid = data.guid
    console.log(data)
    console.log(data.guid)

      // Update the room in the parent component
      const newRoom = {
        id: guid,
        name: newRoomName,
        participants: 1
      };
      
      setCurrentRoom(newRoom);
      setUsername(createUsername);
      
    // check if roomId exists before navigating
  if (guid) {
    navigate(`/chat/${guid}`);
  } else {
    console.error("Room ID is undefined or empty");
    setError("Failed to get a valid room ID");
  }

    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
      
      // For demo, create a dummy room and navigate
      const dummyRoomId = `room-${Date.now()}`;
      const dummyRoom = {
        id: dummyRoomId,
        name: newRoomName,
        participants: 1
      };
      
      setCurrentRoom(dummyRoom);
      setUsername(createUsername);
      navigate(`/chat/${dummyRoomId}`);
    } finally {
      setLoading(false);
      setShowCreateModal(false);
    }
  };

  const openJoinModal = (room) => {
    setSelectedRoom(room);
    setShowJoinModal(true);
  };

  const handleJoinRoom = () => {
    if (!selectedRoom || !joinUsername) return;
    
    setCurrentRoom(selectedRoom);
    setUsername(joinUsername);
    navigate(`/chat/${selectedRoom.id}`);
    setShowJoinModal(false);
  };

  return (
    <div className="room-listing-page">
      <header>
        <h1>Chat Rooms</h1>
        <button 
          className="create-room-btn"
          onClick={() => setShowCreateModal(true)}
          disabled={loading}
        >
          Create New Room
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading rooms...</div>
      ) : (
        <div className="rooms-list">
          <h2>Available Rooms</h2>
          {rooms && rooms.length > 0 ? (
            <ul className="room-list">
              {rooms.map(room => (
                <li key={room.id} className="room-item">
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <p>{room.participants} participants online</p>
                  </div>
                  <button 
                    className="join-btn"
                    onClick={() => openJoinModal(room)}
                  >
                    Join Room
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-rooms">No rooms available. Create one!</p>
          )}
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Room</h2>
            <div className="form-group">
              <label>Room Name:</label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
              />
            </div>
            <div className="form-group">
              <label>Your Name:</label>
              <input
                type="text"
                value={createUsername}
                onChange={(e) => setCreateUsername(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
              <button 
                onClick={handleCreateRoom}
                disabled={!newRoomName || !createUsername || loading}
              >
                Create Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Join {selectedRoom?.name}</h2>
            <div className="form-group">
              <label>Your Name:</label>
              <input
                type="text"
                value={joinUsername}
                onChange={(e) => setJoinUsername(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowJoinModal(false)}>Cancel</button>
              <button 
                onClick={handleJoinRoom}
                disabled={!joinUsername}
              >
                Join Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;