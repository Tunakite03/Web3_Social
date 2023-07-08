import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import PageNotFound from "./pages/PageNotFound";
// import Tasks from './pages/Task'
import { AuthContextProvider } from "./context/AuthContext";
import { useContext, useEffect } from "react";
import { ChatContextProvider } from "./context/ChatContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./style.scss";
import {
  WalletContext,
  WalletContextProvider,
} from "./context/WalletContextProvider";
import { ConnectWalletProvider } from "./context/ConnectWalletContextProvider";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./connectFB/firebase";
import Home from "./pages/Messenger";
import Layout from "./components/Layout";
import Messenger from "./pages/Messenger";
import Targets from "./pages/Targets";
import Tasks from "./pages/Tasks";
import HistoryTransfer from "./pages/HistoryTransfer";
// import HistoryTransfer from './pages/HistoryTransfer';
// import { Elusiv, TokenType } from "@elusiv/sdk";
require("@solana/wallet-adapter-react-ui/styles.css");

const App = () => {
  /* create an account  */
  // const task = Keypair.generate();
  // const programID = new PublicKey(idl.metadata.address)

  const navigate = useNavigate();
  const publicKey = useContext(WalletContext);

  // useEffect(() => {
  //   const checkPublicKey = async () => {
  //     try {
  //       var resolvedPublicKey = await publicKey;
  //       if (resolvedPublicKey) {
  //         console.log(resolvedPublicKey);
  //         const usersRef = collection(db, "users");
  //         const q = query(
  //           usersRef,
  //           where("publicKey", "==", resolvedPublicKey)
  //         );
  //         const querySnapshot = await getDocs(q);
  //         console.log(querySnapshot);
  //         if (querySnapshot.empty) {
  //           navigate("/register");
  //         } else {
  //           navigate("/login");
  //         }
  //       } else {
  //         navigate("/");
  //       }
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  //   checkPublicKey();
  // }, [publicKey, navigate]);

  /* If the user's wallet is not connected, display connect wallet button. */
  return (
    <>

    </>
  );
};

/* wallet configuration as specified here: https://github.com/solana-labs/wallet-adapter#setup */
function AppWithProvider() {
  const ProtectedRoute = ({ children }) => {
    const publicKey = useContext(WalletContext);
    if (publicKey) {
      return children;
    } else {
      return <Navigate to="/" />;
    }
  };

  return (
    <>
      <ConnectWalletProvider>
        <WalletContextProvider>
          <AuthContextProvider>
            <ChatContextProvider>
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    {/* <Route path='/task' element={<Tasks />} /> */}
                    <Route index element={<App />} />
                    <Route
                      path="login"
                      element={
                        <ProtectedRoute>
                          <Login />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="mess"
                      element={
                        <ProtectedRoute>
                          <Messenger />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="register"
                      element={
                        <ProtectedRoute>
                          <Register />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="targets"
                      element={
                        <ProtectedRoute>
                          <Targets />
                        </ProtectedRoute>
                      }
                    />
                    <Route path='/tasks/:targetId' element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                    <Route path='history-transfer' element={<ProtectedRoute><HistoryTransfer /></ProtectedRoute>} />
                    <Route path="*" element={<PageNotFound />} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </ChatContextProvider>
          </AuthContextProvider>
        </WalletContextProvider>
      </ConnectWalletProvider>
    </>
  );
}
export default AppWithProvider;
