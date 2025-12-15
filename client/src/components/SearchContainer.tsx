import { useSearchStore } from "../store/useSearchStore";
import avatar from "../assets/images/avatar.png";

const SearchContainer = () => {
  const { searchLoading, searchResult, createChatWithUser } = useSearchStore();

  const foundUsers = searchResult?.users ?? [];
  const notFound = searchResult?.notFound;

  return (
    <div className="flex-1 overflow-y-auto">
      {searchLoading && (
        <div className="p-4 text-center opacity-70">Searching…</div>
      )}


      {!searchLoading && notFound && foundUsers.length === 0 && (
        <div className="p-4 text-center text-error">No users found</div>
      )}


      {!searchLoading && foundUsers.length > 0 && (
        <div className="divide-y divide-base-300">
          {foundUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => createChatWithUser(user.username)}
              className="w-full p-4 flex items-center gap-3 hover:bg-base-200 transition"
            >
              <img
                src={user.avatar || avatar}
                className="w-12 h-12 rounded-full border border-base-300 object-cover flex-shrink-0"
                alt={user.displayName}
              />

              <div className="flex flex-col text-left flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {user.displayName || user.username}
                </h3>
                <p className="text-sm opacity-70 truncate">@{user.username}</p>
              </div>
            </button>
          ))}
        </div>
      )}


      {!searchLoading && !searchResult && (
        <div className="p-4 text-center opacity-70">
          Search for users by their username
        </div>
      )}
    </div>
  );
};

export default SearchContainer;
