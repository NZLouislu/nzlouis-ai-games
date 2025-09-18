import { ComponentPropsWithoutRef } from "react";

export default function Footer({
  className,
  ...props
}: ComponentPropsWithoutRef<"footer">) {
  return (
    <footer
      className={`py-4 md:py-6 text-center text-xs md:text-sm text-gray-500 ${className}`}
      {...props}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} NZLouis | Louis Lu. All rights
            reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
