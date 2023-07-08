import React, { useContext, useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../connectFB/firebase";
import { WalletContext } from "../context/WalletContextProvider";
import { signOut } from "firebase/auth";
import styled from "@emotion/styled";
import {
  AccountBox,
  ExitToApp,
  MailOutline,
  NotificationsNone,
  Pets,
} from "@mui/icons-material";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  InputBase,
  Badge,
  Avatar,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { PublicKey } from "@solana/web3.js";
const StyledToolbar = styled(Toolbar)({
  display: "flex",
  gap: "5%",
  justifyContent: "space-between",
});
// const Search = styled("div")(({ theme }) => ({
//   backgroundColor: "#fff",
//   padding: "0 20px",
//   borderRadius: "50px",
//   flexGrow: 1,
//   maxWidth: 800,
// }));
const Icons = styled(Box)(({ theme }) => ({
  display: "block",
  alignItems: "center",
  gap: "20px",
}));
const UserBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
}));

function DashHeader() {
  const navigate = useNavigate();
  const [isSelectedWallet, setIsSelectedWallet] = useState(false);
  const { publicKey, wallet } = useContext(WalletContext);
  const { currentUser } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  useEffect(() => {
    const checkWallet = async () => {
      var checkPublicKey = await publicKey;
      var checkCurrentUser = await currentUser;
      if (!checkPublicKey && currentUser) {
        signOut(auth);
        console.log("Da out ra");
      }
      if (currentUser !== null && checkPublicKey !== null) {
        setIsSelectedWallet(true);
      } else {
        setIsSelectedWallet(false);
      }
    };
    const checkPublicKey = async () => {
      try {
        var resolvedPublicKey = await publicKey;
        if (resolvedPublicKey) {
          const usersRef = collection(db, "users");
          const q = query(
            usersRef,
            where("publicKey", "==", resolvedPublicKey.toString())
          );
          const querySnapshot = await getDocs(q);
          console.log(querySnapshot.empty);

          if (querySnapshot.empty) {
            navigate("/register");
          } else if (!currentUser) {
            navigate("/login");
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error(error);
      }
    };
    checkPublicKey();
    checkWallet();
  }, [publicKey, currentUser]);
  return (
    <AppBar position="sticky">
      <StyledToolbar>
        <Typography variant="h6" sx={{ display: { xs: "none", sm: "block" } }}>
          <Link
            to={"/"}
            style={{ color: "#FFF", fontWeight: 600, textDecoration: "none" }}
          >
            SOCIAL TEAM
          </Link>
        </Typography>
        <Pets sx={{ display: { xs: "block", sm: "none" } }} />
        <div className="bg-[#20252e] flex items-center justify-between px-2 py-3">
          <WalletMultiButton />
        </div>
        {isSelectedWallet && (
          <>
            <Icons sx={{ display: { xs: "none", sm: "flex" } }}>
              <Link to="/targets">
                <Button variant="contained" color="secondary">
                  Add your goal
                </Button>
              </Link>
              <Link to="/mess">
                <Button variant="contained" color="secondary">
                  Chat
                </Button>
              </Link>
              <Badge badgeContent={4} color="error">
                <Link to={"/history-transfer"}>
                  {" "}
                  <NotificationsNone />
                </Link>
              </Badge>
            </Icons>
            <UserBox>
              <Typography variant="span">Hello, {currentUser?.displayName}</Typography>
            </UserBox>
          </>
        )}
      </StyledToolbar>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <AccountBox fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Link to={"/profile"}>Profile</Link>
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <ExitToApp fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </AppBar>
  );
}
export default DashHeader;
