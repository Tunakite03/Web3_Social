import React, { useContext, useState } from "react";
import Add from "../img/add.png";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { auth, db, storage } from "../connectFB/firebase";
import { WalletContext } from "../context/WalletContextProvider";
import { Button } from "@mui/material";


const Register = () => {
  const [err, setErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const publicKey = useContext(WalletContext)

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const displayName = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const file = e.target[3].files[0];

    try {
      //Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);
      //Create a unique image name
      const date = new Date().getTime();
      const storageRef = ref(storage, `${displayName + date}`);

      console.log(res.user);

      await uploadBytesResumable(storageRef, file).then(() => {
        getDownloadURL(storageRef).then(async (downloadURL) => {
          try {
            //Update profile
            await updateProfile(res.user, {
              displayName,
              photoURL: downloadURL,
            });
            //create user on firestore
            await setDoc(doc(db, "users", res.user.uid), {
              uid: res.user.uid,
              displayName,
              email,
              photoURL: downloadURL,
              publicKey: publicKey
            });

            //create empty user chats on firestore
            await setDoc(doc(db, "userChats", res.user.uid), {});
            Swal.fire({
              position: "center",
              icon: "success",
              title: "Resgister success",
              showConfirmButton: true,
              timer: 1000,
            });

            navigate("/mess");

          } catch (err) {
            console.log(err);
            setErr(true);
            setLoading(false);
          }
        });
      });

    } catch (err) {
      setErr(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="logo">SOCIAL CHAT</span>
        <span className="title">Register</span>
        <form onSubmit={handleSubmit}>
          <input required type="text" placeholder="display name" />
          <input required type="email" placeholder="email" />
          <input required type="password" placeholder="password" />
          <input required type="file" id="file" />
          <Button disabled={loading} type="submit">Sign up</Button>
          {loading && "Đang tải ảnh và tạo mới vui lòng chờ..."}
          {<span style={{ color: "red" }}>{err}</span>}
        </form>

      </div>

    </div>
  );
};
export default Register;
