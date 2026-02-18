// hooks/useIsMobileLike.js
import { useEffect, useState } from 'react';

export default function useIsMobileLike() {
  const [isMobileLike, setIsMobileLike] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: 768px), ((hover: none) and (pointer: coarse)), (orientation: landscape) and (max-height: 520px)`);
    const update = () => setIsMobileLike(mq.matches);
    update();

    mq.addEventListener?.('change', update);
    mq.addListener?.(update);

    return () => {
      mq.removeEventListener?.('change', update);
      mq.removeListener?.(update);
    };
  }, []);

  return isMobileLike;
}
