import {create} from 'zustand';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axios.config';
type TuserChatstore={
    messages:
    users:
    selectedUser:;
    isUsersLoading:boolean;
    isMessagesLoading:boolean;
    getUsers:()=>Promise<void>;
    getMessages:(userId:string)=>Promise<void>;

}

export const useChatStore=create<TuserChatstore>((set)=>({
    messages:[],
    users:[],
    selectedUser:null,
    isUsersLoading:false,
    isMessagesLoading:false,

    getUsers:async ()=>{
        set({isUsersLoading:true});
        try {
            const res=await axiosInstance.get("/messages/user");
            set({users:res.data});
        } catch (error) {
            console.log(error);
        }finally{
            set({isUsersLoading:false});
        }
    }
    getMessages:async(userId:string)=>{
        set({isMessagesLoading:true})
        try {
            const res=axiosInstance.get(`/messages/${userId}`);
            set({messages:res.data})
        } catch (error) {
            console.log(error);
        }finally{
            set({isMessagesLoading:false});
        }
    }

}))


