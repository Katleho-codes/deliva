import { TMyStores, TStores, TStoresByName } from "@/utils/types";
import { create } from "zustand";

export type StoresStateStore = {
    // state
    stores: TStores[];
    store: TStoresByName | null;
    myStores: TMyStores[];

    // stores (public listing)
    setStores: (stores: TStores[]) => void;
    updateOneStore: (updated: TStores) => void;

    // single store
    setStore: (store: TStoresByName | null) => void;

    // my stores
    setMyStores: (myStores: TMyStores[]) => void;
    addMyStore: (store: TMyStores) => void;
    updateMyStore: (updated: TMyStores) => void;
    removeStore: (id: number) => void;
};

const useStoresStateStore = create<StoresStateStore>((set) => ({
    stores: [],
    store: null,
    myStores: [],

    // stores (public listing)
    setStores: (stores) => set({ stores }),
    updateOneStore: (updated) =>
        set((state) => ({
            stores: state.stores.map((s) =>
                s.id === updated.id ? updated : s,
            ),
        })),

    // single store
    setStore: (store) => set({ store }),

    // my stores
    setMyStores: (myStores) => set({ myStores }),
    addMyStore: (store) =>
        set((state) => ({
            myStores: [store, ...state.myStores],
        })),
    updateMyStore: (updated) =>
        set((state) => ({
            myStores: state.myStores.map((s) =>
                s.id === updated.id ? updated : s,
            ),
        })),
    removeStore: (id) =>
        set((state) => ({
            stores: state.stores.filter((s) => s.id !== id),
            myStores: state.myStores.filter((s) => s.id !== id),
            store: state.store?.id === id ? null : state.store,
        })),
}));

export default useStoresStateStore;
