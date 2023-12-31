import React, { useEffect } from "react";
import { useRouter } from "next/router";

import Button from "@/components/atoms/Button";
import { useSession } from "next-auth/react";

const UserProfileAlbums = () => {
  const { pathname } = useRouter();
  const { data: session } = useSession();

  const { personId } = session?.user ?? {};

  useEffect(() => {
    if (pathname === "/account") {
      document.body.classList.add("overflow-x-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-x-hidden");
    };
  }, [pathname]);

  return (
    <div className="absolute right-0 mx-2 hidden h-[80vh] w-[30%] flex-1 flex-1 overflow-hidden bg-[url(/assets/bg-tree.png)] bg-cover bg-no-repeat p-2 md:flex">
      <div className="flex h-[70vh] w-[100%] flex-col items-center justify-center">
        <Button
          href={`/user/${personId}/gallery`}
          intent="primary"
          className="mx-1 my-2 w-1/2 rounded-[2.5rem]"
        >
          View Album
        </Button>
        <Button
          href={`/user/${personId}/gallery/add`}
          intent="outline"
          className="mx-1 my-2 w-1/2 rounded-[2.5rem]"
        >
          Add Photos
        </Button>
      </div>
    </div>
  );
};

export default UserProfileAlbums;
