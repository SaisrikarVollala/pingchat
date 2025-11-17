import { useSearchStore } from "../store/useSearchStore";

const SearchContainer = () => {
  const { searchLoading, searchResult, createChatWithUser } = useSearchStore();

  const foundUser = searchResult?.user ?? null;
  const notFound = searchResult?.notFound;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Searching */}
      {searchLoading && (
        <div className="p-4 text-center opacity-70">Searching…</div>
      )}

      {/* No results */}
      {!searchLoading && notFound && (
        <div className="p-4 text-center text-error">User not found</div>
      )}

      {/* User is null or undefined */}
      {!searchLoading && searchResult && !foundUser && !notFound && (
        <div className="p-4 text-center opacity-70">User not available</div>
      )}

      {/* Valid user */}
      {foundUser && (
        <button
          onClick={() => createChatWithUser(foundUser.username)}
          className="w-full p-4 flex items-center gap-3 hover:bg-base-200 transition"
        >
          <img
            src={foundUser.avatar || "/avatar.png"}
            className="w-12 h-12 rounded-full border border-base-300 object-cover"
            alt=""
          />

          <div className="flex flex-col text-left">
            <h3 className="font-semibold">
              {foundUser.displayName || foundUser.username}
            </h3>
            <p className="text-sm opacity-70">@{foundUser.username}</p>
          </div>
        </button>
      )}

      {/* Default prompt */}
      {!searchLoading && !searchResult && (
        <div className="p-4 text-center opacity-70">
          Search using your friend's username
        </div>
      )}
    </div>
  );
};

export default SearchContainer;
