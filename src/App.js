import { useState } from "react";

/* ✅ centralised avatar generator */
function getAvatar(name) {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${name}`;
}

const initialFriends = [
  {
    id: 118836,
    name: "Clark",
    image: getAvatar("Clark"),
    balance: -67,
  },
  {
    id: 933372,
    name: "Sarah",
    image: getAvatar("Sarah"),
    balance: 20,
  },
  {
    id: 499476,
    name: "Ymag",
    image: getAvatar("Ymag"),
    balance: 0,
  },
];

export default function App() {
  const [friends, setFriends] = useState(initialFriends);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  function handleShowAddFriend() {
    setShowAddFriend((show) => !show);
  }

  function handleAddFriend(friend) {
    setFriends((friends) => [...friends, friend]);
  }

  function handleSelection(friend) {
    setSelectedFriend((current) => (current?.id === friend.id ? null : friend));
    setShowAddFriend(false);
  }

  function handleSplitBill(value) {
    setFriends((friends) =>
      friends.map((friend) =>
        friend.id === selectedFriend.id
          ? { ...friend, balance: friend.balance + value }
          : friend,
      ),
    );
    setSelectedFriend(null);
  }

  //handle deleting friends
  function handleDeleteFriend(fri) {
    //ask for confirmation

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${fri.name} detail?`,
    );
    // if false nothing happen
    if (!confirmDelete) return;

    //if not continue the delete

    setFriends((friends) => friends.filter((friend) => friend.id !== fri.id));

    //remove the split bill form

    if (selectedFriend?.id === fri.id) {
      setSelectedFriend(null);
    }
  }

  return (
    <div className="app">
      <div className="sidebar">
        <FriendsList
          friends={friends}
          selectedFriend={selectedFriend}
          onSelection={handleSelection}
          onDeleteFriend={handleDeleteFriend}
        />

        {showAddFriend && <FormAddFriend onAddFriend={handleAddFriend} />}

        <Button theFunction={handleShowAddFriend}>
          {showAddFriend ? "Close" : "Add Friend"}
        </Button>
      </div>

      {selectedFriend && (
        <FormSplitBill
          selectedFriend={selectedFriend}
          handleSplitBill={handleSplitBill}
        />
      )}
    </div>
  );
}

function FriendsList({ friends, onSelection, selectedFriend, onDeleteFriend }) {
  return (
    <ul>
      {friends.map((friend) => (
        <Friend
          key={friend.id}
          friend={friend}
          onSelection={onSelection}
          selectedFriend={selectedFriend}
          onDeleteFriend={onDeleteFriend}
        />
      ))}
    </ul>
  );
}

function Friend({ friend, onSelection, selectedFriend, onDeleteFriend }) {
  const isSelected = selectedFriend?.id === friend.id;

  return (
    <li className={isSelected ? "selected" : ""}>
      <img src={friend.image} alt={friend.name} />
      <h3>{friend.name}</h3>

      {friend.balance < 0 && (
        <p className="red">
          You owe {friend.name} {Math.abs(friend.balance)}$
        </p>
      )}

      {friend.balance > 0 && (
        <p className="green">
          {friend.name} owes you {Math.abs(friend.balance)}$
        </p>
      )}

      {friend.balance === 0 && <p>You and {friend.name} are even</p>}

      <button className="button" onClick={() => onSelection(friend)}>
        {isSelected ? "Close" : "Select"}
      </button>
      <button className="delete-button" onClick={() => onDeleteFriend(friend)}>
        ⊗
      </button>
    </li>
  );
}

function Button({ children, theFunction }) {
  return (
    <button className="button" onClick={theFunction}>
      {children}
    </button>
  );
}

function FormAddFriend({ onAddFriend }) {
  const [name, setName] = useState("");
  const [localImage, setLocalImage] = useState("");
  const [imageName, setImageName] = useState("");

  function handleImageUpload(e) {
    const file = e.target.files[0];

    if (!file) return;

    setImageName(file.name);

    const reader = new FileReader();
    reader.onload = () => setLocalImage(reader.result);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!name) return;

    const id = crypto.randomUUID();

    const newFriend = {
      id,
      name,
      image: localImage || getAvatar(id),
      balance: 0,
    };

    onAddFriend(newFriend);

    setName("");
    setLocalImage("");
  }

  return (
    <form className="form-add-friend" onSubmit={handleSubmit}>
      <label>👥Friend name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label htmlFor="file-upload">👆Upload image (Optional)</label>

      <div className="image-preview-container">
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />

        {localImage && (
          <img className="friend-preview" src={localImage} alt="Preview" />
        )}
      </div>

      <Button>Add</Button>
    </form>
  );
}

function FormSplitBill({ selectedFriend, handleSplitBill }) {
  const [bill, setBill] = useState("");
  const [paidByUser, setPaidByUser] = useState("");
  const [whoIsPlaying, setWhoIsPlaying] = useState("user");

  const paidByFriend = bill ? bill - paidByUser : "";

  function handleSubmit(e) {
    e.preventDefault();

    if (!bill || !paidByUser) return;

    const value = whoIsPlaying === "user" ? paidByFriend : -paidByUser;

    handleSplitBill(value);
  }

  return (
    <form className="form-split-bill" onSubmit={handleSubmit}>
      <h2>Split a bill with {selectedFriend.name}</h2>

      <label>💵 Bill value</label>
      <input
        type="number"
        value={bill}
        onChange={(e) => setBill(Number(e.target.value))}
      />

      <label>🧍 Your expense</label>
      <input
        type="number"
        value={paidByUser}
        onChange={(e) => setPaidByUser(Number(e.target.value))}
      />

      <label>🧑‍🤝‍🧑 {selectedFriend.name}'s expense</label>
      <input type="text" disabled value={paidByFriend} />

      <label>🤑 Who is paying?</label>
      <select
        value={whoIsPlaying}
        onChange={(e) => setWhoIsPlaying(e.target.value)}
      >
        <option value="user">You</option>
        <option value="friend">{selectedFriend.name}</option>
      </select>

      <Button>Split bill</Button>
    </form>
  );
}
