import { useEffect } from "react";

export function useKey(keyname, action) {
  useEffect(() => {
    function escapeReturn(e) {
      if (e.code.toLowerCase() === keyname.toLowerCase()) {
        action();
      }
    }
    document.addEventListener("keydown", escapeReturn);
    return function () {
      document.removeEventListener("keydown", escapeReturn);
    };
  }, [keyname, action]);
}
