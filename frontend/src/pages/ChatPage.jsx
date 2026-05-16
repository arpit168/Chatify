import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";
import { Menu, X, MessageCircle, Users, ChevronLeft } from "lucide-react";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowSidebar(!selectedUser);
      } else {
        setShowSidebar(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [selectedUser]);

  const toggleSidebar = () => {
    if (isMobile) {
      setShowSidebar(!showSidebar);
      setIsMobileMenuOpen(!isMobileMenuOpen);
    }
  };

  const handleBackToChats = () => {
    if (isMobile && selectedUser) {
      setShowSidebar(true);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-4 bg-linear-to-br from-slate-900 via-purple-900/20 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-60 h-60 sm:w-80 sm:h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-60 h-60 sm:w-80 sm:h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        {/* Animated particles */}
        <div className="hidden sm:block">
          <div className="absolute top-20 left-10 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
          <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping delay-300"></div>
          <div className="absolute bottom-20 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping delay-700"></div>
        </div>
      </div>

      {/* Mobile Header */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-20 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 px-4 py-3 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            {selectedUser && showSidebar ? (
              <button
                onClick={handleBackToChats}
                className="p-2 hover:bg-slate-800 rounded-lg transition-all duration-300 text-slate-400 hover:text-cyan-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-slate-800 rounded-lg transition-all duration-300 text-slate-400 hover:text-cyan-400"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-linear-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-linear-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                ChatVerse
              </h1>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
              <div className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-300 ${activeTab === 'chats' ? 'bg-linear-to-r from-cyan-500 to-purple-600 text-white shadow-lg' : 'text-slate-400'}`}>
                <MessageCircle className="w-3 h-3 inline mr-1" />
                Chats
              </div>
              <div className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-300 ${activeTab === 'contacts' ? 'bg-linear-to-r from-cyan-500 to-purple-600 text-white shadow-lg' : 'text-slate-400'}`}>
                <Users className="w-3 h-3 inline mr-1" />
                Contacts
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-7xl h-[85vh] sm:h-[90vh] md:h-[85vh] lg:h-200 mt-14 sm:mt-0 animate-fadeIn">
        <BorderAnimatedContainer>
          <div className="flex w-full h-full rounded-2xl overflow-hidden shadow-2xl">
            
            {/* LEFT SIDEBAR - Responsive visibility */}
            <div className={`
              ${isMobile ? 'fixed inset-0 z-30 transition-transform duration-300 ease-in-out' : 'relative w-80 lg:w-96'}
              ${isMobile && !showSidebar ? 'transform -translate-x-full' : 'transform translate-x-0'}
              bg-linear-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-xl flex flex-col
              ${isMobile ? 'rounded-r-2xl' : ''}
            `}>
              {/* Sidebar Header for Mobile */}
              {isMobile && (
                <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-linear-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-200">Chats</h2>
                  </div>
                  <button
                    onClick={toggleSidebar}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-all duration-300 text-slate-400 hover:text-cyan-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Profile Header - Hidden on mobile when chat is open */}
              <div className={`${isMobile && selectedUser && !showSidebar ? 'hidden' : 'block'}`}>
                <ProfileHeader />
              </div>
              
              {/* Tab Switch - Desktop */}
              <div className={`${isMobile && selectedUser && !showSidebar ? 'hidden' : 'block'} hidden sm:block`}>
                <ActiveTabSwitch />
              </div>

              {/* Chat/Contact Lists */}
              <div className={`flex-1 overflow-y-auto custom-scrollbar ${isMobile && selectedUser && !showSidebar ? 'hidden' : 'block'}`}>
                <div className="p-3 sm:p-4 space-y-2">
                  {activeTab === "chats" ? <ChatsList /> : <ContactList />}
                </div>
              </div>

              {/* Mobile Bottom Navigation */}
              {isMobile && !selectedUser && (
                <div className="border-t border-slate-700/50 bg-slate-900/50 p-2">
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-linear-to-r from-cyan-500/20 to-purple-500/20 rounded-lg text-xs font-medium text-cyan-400 border border-cyan-400/30">
                      New Chat
                    </button>
                    <button className="flex-1 py-2 bg-linear-to-r from-cyan-500/20 to-purple-500/20 rounded-lg text-xs font-medium text-cyan-400 border border-cyan-400/30">
                      Find Friends
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Overlay for mobile sidebar */}
            {isMobile && showSidebar && !selectedUser && (
              <div
                className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
                onClick={toggleSidebar}
              />
            )}

            {/* RIGHT SIDE - Chat Area */}
            <div className={`
              flex-1 flex flex-col bg-linear-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm
              ${isMobile && !selectedUser ? 'hidden' : 'flex'}
            `}>
              {selectedUser ? (
                <>
                  {/* Mobile Chat Header */}
                  {isMobile && (
                    <div className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 p-3 flex items-center gap-3">
                      <button
                        onClick={handleBackToChats}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-all duration-300 text-slate-400 hover:text-cyan-400"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-linear-to-r from-cyan-400 to-purple-500 flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {selectedUser.fullName?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-200">{selectedUser.fullName}</h3>
                          <p className="text-xs text-green-500">Online</p>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-slate-800 rounded-lg transition-all duration-300 text-slate-400 hover:text-cyan-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <ChatContainer />
                </>
              ) : (
                <NoConversationPlaceholder />
              )}
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-linear(to bottom, #06b6d4, #8b5cf6);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-linear(to bottom, #0891b2, #7c3aed);
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-700 {
          animation-delay: 700ms;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}

export default ChatPage;