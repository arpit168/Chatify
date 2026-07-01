import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  groups: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null, // this will also be used for selected group (with an isGroup flag)
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  // Typing & presence
  typingUsers: {},
  searchQuery: "",
  searchResults: [],
  isSearching: false,

  // Reply state
  replyingTo: null,
  setReplyingTo: (msg) => set({ replyingTo: msg }),
  clearReply: () => set({ replyingTo: null }),

  // Edit state
  editingMessage: null,
  setEditingMessage: (msg) => set({ editingMessage: msg }),
  clearEditingMessage: () => set({ editingMessage: null }),

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => {
    set({ selectedUser, replyingTo: null, editingMessage: null });
  },

  // ─── CONTACTS & CHATS ──────────────────────────────────────
  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load contacts");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load chats");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyGroups: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/groups/all");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load groups");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  updateGroup: async (groupId, data) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}`, data);
      set({
        groups: get().groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedUser: get().selectedUser?._id === groupId ? { ...res.data, isGroup: true, fullName: res.data.name, profilePic: res.data.avatar } : get().selectedUser,
      });
      toast.success("Group updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update group");
    }
  },

  addGroupMembers: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/add-members`, { memberIds });
      set({
        groups: get().groups.map((g) => (g._id === groupId ? res.data : g)),
        selectedUser: get().selectedUser?._id === groupId ? { ...res.data, isGroup: true, fullName: res.data.name, profilePic: res.data.avatar } : get().selectedUser,
      });
      toast.success("Members added");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add members");
    }
  },

  removeGroupMember: async (groupId, memberId) => {
    try {
      const res = await axiosInstance.post(`/groups/${groupId}/remove-member`, { memberId });
      if (res.data.message === "Group deleted" || memberId === useAuthStore.getState().authUser._id) {
        set({
          groups: get().groups.filter((g) => g._id !== groupId),
          selectedUser: get().selectedUser?._id === groupId ? null : get().selectedUser,
        });
      } else {
        set({
          groups: get().groups.map((g) => (g._id === groupId ? res.data : g)),
          selectedUser: get().selectedUser?._id === groupId ? { ...res.data, isGroup: true, fullName: res.data.name, profilePic: res.data.avatar } : get().selectedUser,
        });
      }
      toast.success("Member removed / left");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    }
  },

  // ─── MESSAGES ──────────────────────────────────────────────
  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const { selectedUser } = get();
      let res;
      if (selectedUser?.isGroup) {
        res = await axiosInstance.get(`/groups/${userId}`);
      } else {
        res = await axiosInstance.get(`/messages/${userId}`);
      }
      // Support both old format (array) and new format (object with messages)
      const msgs = Array.isArray(res.data) ? res.data : res.data.messages || [];
      set({ messages: msgs });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages, replyingTo, editingMessage } = get();
    const { authUser } = useAuthStore.getState();
    if (!selectedUser) return;

    if (editingMessage) {
      return get().editMessage(editingMessage._id, messageData.text);
    }

    const tempId = `temp-${Date.now()}`;
    const payload = { ...messageData };
    if (replyingTo) {
      payload.replyToId = replyingTo._id;
    }

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser.isGroup ? null : selectedUser._id,
      groupId: selectedUser.isGroup ? selectedUser._id : null,
      text: messageData.text,
      image: messageData.image,
      replyTo: replyingTo || null,
      createdAt: new Date().toISOString(),
      status: "sent",
      reactions: [],
      isOptimistic: true,
    };

    set({ messages: [...messages, optimisticMessage], replyingTo: null });

    try {
      let res;
      if (selectedUser.isGroup) {
        res = await axiosInstance.post(`/groups/send/${selectedUser._id}`, payload);
      } else {
        res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, payload);
      }
      // Replace optimistic message with server response
      set({
        messages: get().messages.map((m) => (m._id === tempId ? res.data : m)),
      });
      // Refresh chat list to update last message
      get().getMyChatPartners();
    } catch (error) {
      set({ messages: get().messages.filter((m) => m._id !== tempId) });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  // ─── EDIT MESSAGE ─────────────────────────────────────────
  editMessage: async (messageId, newText) => {
    try {
      await axiosInstance.put(`/messages/edit/${messageId}`, { text: newText });
      set({
        messages: get().messages.map((m) =>
          m._id === messageId
            ? { ...m, text: newText, isEdited: true, editedAt: new Date().toISOString() }
            : m
        ),
        editingMessage: null,
      });

      // Emit socket event
      const socket = useAuthStore.getState().socket;
      const { selectedUser } = get();
      socket?.emit("messageEdited", {
        messageId,
        newText,
        receiverId: selectedUser._id,
      });
    } catch (error) {
      toast.error("Failed to edit message");
    }
  },

  // ─── DELETE MESSAGE ───────────────────────────────────────
  deleteMessage: async (messageId, deleteForEveryone = false) => {
    try {
      await axiosInstance.delete(`/messages/delete/${messageId}`, {
        data: { deleteForEveryone },
      });

      if (deleteForEveryone) {
        set({
          messages: get().messages.map((m) =>
            m._id === messageId
              ? { ...m, deletedForEveryone: true, text: "", image: "" }
              : m
          ),
        });
        const socket = useAuthStore.getState().socket;
        const { selectedUser } = get();
        socket?.emit("messageDeleted", {
          messageId,
          receiverId: selectedUser._id,
          deleteForEveryone: true,
        });
      } else {
        set({
          messages: get().messages.filter((m) => m._id !== messageId),
        });
      }
    } catch (error) {
      toast.error("Failed to delete message");
    }
  },

  // ─── REACT TO MESSAGE ────────────────────────────────────
  reactToMessage: async (messageId, emoji) => {
    try {
      const res = await axiosInstance.post(`/messages/react/${messageId}`, { emoji });
      set({
        messages: get().messages.map((m) =>
          m._id === messageId ? { ...m, reactions: res.data.reactions } : m
        ),
      });
    } catch (error) {
      toast.error("Failed to react");
    }
  },

  // ─── STAR MESSAGE ─────────────────────────────────────────
  starMessage: async (messageId) => {
    try {
      const res = await axiosInstance.post(`/messages/star/${messageId}`);
      set({
        messages: get().messages.map((m) =>
          m._id === messageId ? { ...m, starredBy: res.data.starredBy } : m
        ),
      });
    } catch (error) {
      toast.error("Failed to star message");
    }
  },

  // ─── PIN MESSAGE ──────────────────────────────────────────
  pinMessage: async (messageId) => {
    try {
      const res = await axiosInstance.post(`/messages/pin/${messageId}`);
      set({
        messages: get().messages.map((m) =>
          m._id === messageId ? { ...m, isPinned: res.data.isPinned } : m
        ),
      });
    } catch (error) {
      toast.error("Failed to pin message");
    }
  },

  // ─── FORWARD MESSAGE ──────────────────────────────────────
  forwardMessage: async (messageId, receiverId) => {
    try {
      const res = await axiosInstance.post(`/messages/forward/${messageId}`, { receiverId });
      // If we are currently chatting with the receiver, append it
      const { selectedUser } = get();
      if (selectedUser && selectedUser._id === receiverId) {
        set({ messages: [...get().messages, res.data] });
      }
      toast.success("Message forwarded");
    } catch (error) {
      toast.error("Failed to forward message");
    }
  },

  // ─── SEARCH ───────────────────────────────────────────────
  searchUsers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }
    set({ isSearching: true });
    try {
      const res = await axiosInstance.get(`/messages/search-users?q=${query}`);
      set({ searchResults: res.data });
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      set({ isSearching: false });
    }
  },

  // ─── TYPING ───────────────────────────────────────────────
  emitTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });
    }
  },

  emitStopTyping: () => {
    const socket = useAuthStore.getState().socket;
    const { selectedUser } = get();
    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }
  },

  // ─── SOCKET SUBSCRIPTIONS ────────────────────────────────
  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    socket.on("userTyping", ({ userId }) => {
      if (userId === selectedUser._id) {
        set({ typingUsers: { ...get().typingUsers, [userId]: true } });
      }
    });

    socket.on("userStoppedTyping", ({ userId }) => {
      if (userId === selectedUser._id) {
        const updated = { ...get().typingUsers };
        delete updated[userId];
        set({ typingUsers: updated });
      }
    });

    socket.on("messagesSeen", ({ by }) => {
      if (by === selectedUser._id) {
        set({
          messages: get().messages.map((m) =>
            m.senderId === useAuthStore.getState().authUser._id
              ? { ...m, status: "seen" }
              : m
          ),
        });
      }
    });

    socket.on("messageEditedUpdate", ({ messageId, newText }) => {
      set({
        messages: get().messages.map((m) =>
          m._id === messageId ? { ...m, text: newText, isEdited: true } : m
        ),
      });
    });

    socket.on("messageDeletedUpdate", ({ messageId }) => {
      set({
        messages: get().messages.map((m) =>
          m._id === messageId
            ? { ...m, deletedForEveryone: true, text: "", image: "" }
            : m
        ),
      });
    });

    socket.on("messageReactionUpdate", ({ messageId, reactions }) => {
      set({
        messages: get().messages.map((m) =>
          m._id === messageId ? { ...m, reactions } : m
        ),
      });
    });

    socket.on("messagePinnedUpdate", (updatedMessage) => {
      set({
        messages: get().messages.map((m) =>
          m._id === updatedMessage._id ? { ...m, isPinned: updatedMessage.isPinned } : m
        ),
      });
    });

    socket.on("newGroupCreated", (newGroup) => {
      const currentGroups = get().groups;
      if (!currentGroups.some((g) => g._id === newGroup._id)) {
        set({ groups: [newGroup, ...currentGroups] });
      }
    });

    socket.on("newGroupMessage", (newMsg) => {
      if (selectedUser?.isGroup && selectedUser._id === newMsg.groupId) {
        set({ messages: [...get().messages, newMsg] });
      }
      set({
        groups: get().groups.map((g) =>
          g._id === newMsg.groupId ? { ...g, lastMessage: newMsg, updatedAt: new Date().toISOString() } : g
        ),
      });
    });

    socket.on("groupUpdated", (updatedGrp) => {
      set({
        groups: get().groups.map((g) => (g._id === updatedGrp._id ? updatedGrp : g)),
        selectedUser: selectedUser?._id === updatedGrp._id ? { ...updatedGrp, isGroup: true, fullName: updatedGrp.name, profilePic: updatedGrp.avatar } : selectedUser,
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;
    socket.off("newMessage");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
    socket.off("messagesSeen");
    socket.off("messageEditedUpdate");
    socket.off("messageDeletedUpdate");
    socket.off("messageReactionUpdate");
    socket.off("messagePinnedUpdate");
    socket.off("newGroupCreated");
    socket.off("newGroupMessage");
    socket.off("groupUpdated");
  },
}));