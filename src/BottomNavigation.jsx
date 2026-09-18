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
      { name: "Wallet", icon: Wallet, page: "tool" },
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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
      <div className="flex h-[82px] items-end justify-around px-2">

        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.name;

          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.page)}
              className={`flex h-full w-[20%] flex-col items-center justify-center ${
                isActive ? "text-green-600" : "text-gray-500"
              }`}
            >
              {item.name === "Wallet" ? (
                <div className="flex h-12 w-12 -mt-7 items-center justify-center rounded-full bg-yellow-400 shadow-md">
                  <Icon
                    size={24}
                    className="text-gray-800"
                  />
                </div>
              ) : (
                <Icon
                  size={23}
                  strokeWidth={isActive ? 2.8 : 2}
                />
              )}

              <span
                className={`mt-1 text-[11px] ${
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
