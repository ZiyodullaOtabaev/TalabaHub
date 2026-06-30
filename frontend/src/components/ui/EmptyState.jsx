import { Plus } from "lucide-react"

export default function Button({ children, icon, className = "", ...props }) {

    return (

        <button

            className={`

flex
items-center
justify-center
gap-2

h-[44px]
px-4

rounded-xl

bg-indigo-600
text-white

font-semibold

hover:bg-indigo-500
hover:scale-105

transition

${className}

`}

            {...props}

        >

            {icon && <Plus size={18} />}

            {children}

        </button>

    )

}