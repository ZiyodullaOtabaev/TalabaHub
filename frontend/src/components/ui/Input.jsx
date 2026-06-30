export default function Input({ className = "", ...props }) {

    return (

        <input

            className={`

w-full
h-[44px]

px-3

rounded-xl

border
border-slate-200
dark:border-slate-700

bg-white
dark:bg-slate-900

text-sm

outline-none

focus:ring-2
focus:ring-indigo-500

transition

${className}

`}

            {...props}

        />

    )

}