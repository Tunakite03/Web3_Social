import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import imageLoading from "../img/file-upload-line.png";
const Message = ({ message }) => {
  const { currentUser } = useContext(AuthContext);
  const { data } = useContext(ChatContext);
  const [imageLoaded, setImageLoaded] = useState(false);

  const ref = useRef();

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [message]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div
      ref={ref}
      className={`message ${message.senderId === currentUser.uid && "owner"}`}
    >
      <div className="messageInfo">
        <img
          src={
            message.senderId === currentUser.uid
              ? currentUser.photoURL
              : data.user.photoURL
          }
          alt=""
        />
      </div>
      <div className="messageContent">
        {message.text ? <p>{message.text}</p> : null}

        {message.img && (
          <div style={{ textAlign: "center" }}>
            {!imageLoaded && <img src={imageLoading} alt="" />}
            <img
              src={message.img}
              alt=""
              onLoad={handleImageLoad}
              style={{ display: imageLoaded ? "block" : "none" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
