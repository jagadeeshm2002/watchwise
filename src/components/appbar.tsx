import React from "react";
import { Search } from "lucide-react";
import { NavUser } from "./nav-user";

type Props = {};

const AppBar = (props: Props) => {
  const user = {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  };

  return (
    <header className="flex w-full h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
      <div className="flex items-center justify-between w-full gap-4">
        {/* Search Bar */}
        <div></div>
        <div className="flex-1 max-w-md">
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
        
        {/* NavUser Avatar */}
        <NavUser user={user} />
      </div>
    </header>
  );
};

export default AppBar;