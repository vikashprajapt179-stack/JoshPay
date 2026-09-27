import {
  Home,
  CreditCard,
  Wallet,
  BarChart3,
  User,
} from "lucide-react";

function BottomNavigation({ active = "Home", onNavigate }) {
  const items = [
    {
      name: "Home",
      icon: Home,
      page: "home",
    },
    {
      name: "Payment",
      icon: CreditCard,
      page: "payment",
    },
    {
      name: "Wallet",
      icon: Wallet,
      page: "tool",
    },
    {
      name: "Statistics",
      icon: BarChart3,
      page: "statistics",
    },
    {
      name: "My",
      icon: User,
      page: "my",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-gray-200 bg-white">

      <div className="mx-auto flex h-[68px] sm:h-[82px] w-full max-w-[420px] items-end justify-around px-1 sm:px-2">

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.name;

          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onNavigate(item.page)}
              className={`flex h-full w-[20%] min-w-0 flex-col items-center justify-center transition-colors ${
                isActive
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
            >

              {/* WALLET CENTER BUTTON */}

              {item.name === "Wallet" ? (
                <div className="flex h-11 w-11 sm:h-12 sm:w-12 -mt-5 sm:-mt-7 shrink-0 items-center justify-center rounded-full bg-yellow-400 shadow-md">

                  <Icon
                    size={22}
                    className="text-gray-800 sm:hidden"
                  />

                  <Icon
                    size={24}
                    className="hidden text-gray-800 sm:block"
                  />

                </div>
              ) : (
                <Icon
                  size={21}
                  className="sm:hidden"
                  strokeWidth={isActive ? 2.8 : 2}
                />
              )}

              {item.name !== "Wallet" && (
                <Icon
                  size={23}
                  className="hidden sm:block"
                  strokeWidth={isActive ? 2.8 : 2}
                />
              )}

              <span
                className={`mt-1 text-[10px] sm:text-[11px] whitespace-nowrap ${
                  isActive
                    ? "font-semibold"
                    : "font-medium"
                }`}
              >
                {item.name}
              </span>

            </button>
          );
        })}

      </div>
    </div>
  );
}

export default BottomNavigation;