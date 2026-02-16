export default function LoadingSpinner() {
<div
  class="mx-auto w-[600px] bg-gray-950 rounded-xl overflow-hidden drop-shadow-2xl"
>
  <div
    class="bg-[#202020] flex items-center p-[20px] text-white relative rounded-t-xl"
  >
    <div class="flex absolute left-3 space-x-2">
      <span
        class="h-3.5 w-3.5 bg-[#ff605c] rounded-full transition-all hover:scale-125 hover:bg-[#ff3b36]"
      ></span>
      <span
        class="h-3.5 w-3.5 bg-[#ffbd44] rounded-full transition-all hover:scale-125 hover:bg-[#ffaa33]"
      ></span>
      <span
        class="h-3.5 w-3.5 bg-[#00ca4e] rounded-full transition-all hover:scale-125 hover:bg-[#00b44e]"
      ></span>
    </div>

    <div
      class="flex-1 text-center text-white font-semibold text-lg relative animate-pulse"
    >
      <div class="text-xl">Loading...</div>
    </div>

    <div class="absolute w-full bottom-0 left-0 bg-[#333333] h-1 rounded-t-xl">
      <div class="w-[30%] bg-[#00e600] h-full animate-progressBar"></div>
    </div>
  </div>

  <div class="flex bg-[#121212] p-8 justify-center items-center h-[450px]">
    <div class="text-center space-y-6">
      <div
        class="w-24 h-24 border-4 border-t-[#00e600] border-gray-700 rounded-full animate-spin mx-auto"
      ></div>
      <div
        class="text-[#00e600] font-semibold text-4xl opacity-90 animate-fadeIn"
      >
        Almost There...
      </div>
      <div class="text-[#9e9e9e] text-sm opacity-80 animate-fadeIn">
        <p>We're getting everything ready for you...</p>
        <p>Sit tight for just a moment.</p>
      </div>
    </div>
  </div>

  <div class="bg-[#202020] p-4 text-center text-gray-400 text-xs font-mono">
    <p>Appreciate your patience. Almost there!</p>
  </div>
</div>

}