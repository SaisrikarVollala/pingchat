const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
      {skeletonMessages.map((_, idx) => (
        <div key={idx} className={`chat ${idx % 2 === 0 ? "chat-start" : "chat-end"}`}>
          
          {/* Avatar */}
          <div className="chat-image avatar">
            <div className="size-10 rounded-full">
              <div className="skeleton w-full h-full rounded-full" />
            </div>
          </div>

          {/* Time */}
          <div className="chat-header mb-1">
            <div className="skeleton h-3 w-20" />
          </div>

          {/* Bubble */}
          <div className="chat-bubble p-0 bg-transparent">
            <div className="skeleton h-10 w-[250px] rounded-lg" />
          </div>

        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
