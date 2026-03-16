import React from "react";

export interface TemplateComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Description for title */
  title: string;
  /** Description for optional description */
  description?: string;
}

export function TemplateComponent({
  title,
  description,
  ...props
}: TemplateComponentProps) {
  return (
    <div className={"flex flex-col gap-2 p-4 border rounded-md"} {...props}>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
  );
}
