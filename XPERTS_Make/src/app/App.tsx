import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <div className="size-full bg-[#F8FAFC]">
      <RouterProvider router={router} />
    </div>
  );
}