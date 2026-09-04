import Image from "next/image"

export function HuaweiBadge() {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E5E4DF] w-fit">
            <div className="w-4 h-4 rounded-sm bg-[#CF0A2C] flex items-center justify-center shrink-0">
                <span className="text-white font-bold" style={{ fontSize: "8px" }}>H</span>
            </div>
            <span className="text-xs text-[#666]">Powered by</span>
            <span className="text-xs font-semibold text-[#CF0A2C]">Huawei Cloud</span>
        </div>
    )
}