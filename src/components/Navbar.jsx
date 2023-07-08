import React, { useContext, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
// import { AuthContext } from "../context/AuthContext";
// import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../connectFB/firebase";


const Navbar = () => {
//   const { currentUser } = useContext(AuthContext);
//   const [users, setUsers] = useState("");

//   useEffect(() => {
//     if (currentUser && currentUser.uid) {
//       const docRef = doc(db, "users", currentUser.uid);
//       const unsubscribe = onSnapshot(docRef, (doc) => {
//         if (doc.exists()) {
//           setUsers(doc.data());
//         } else {
//           console.log("User document does not exist.");
//         }
//       });

//       return () => unsubscribe();
//     }
//   }, [currentUser]);
//   console.log("Users:", users);

  return (
    <div className="navbar">
      <span className="logo">
        TunaChat
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path fill="none" d="M0 0h24v24H0z" />
          <path
            d="M6.455 19L2 22.5V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H6.455zm5.563-4.3l3.359-3.359a2.25 2.25 0 0 0-3.182-3.182l-.177.177-.177-.177a2.25 2.25 0 0 0-3.182 3.182l3.359 3.359z"
            fill="rgba(255,255,255,1)"
          />
        </svg>
      </span>
      {/* <div className="user">
        <img src={currentUser.photoURL} alt="" />
        <span>{currentUser.displayName}</span>

        <button onClick={() => signOut(auth)}>Logout</button>
      </div> */}
    </div>
  );
};

export default Navbar;
