import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import socket from "./socket";

const useSocket = () => {
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user?.id) return;

        socket.connect(); // server auto-joins the room on connection
        socket.emit("join", session.user.id);

        return () => {
            socket.disconnect();
        };
    }, [session?.user?.id]);
};

export default useSocket;
