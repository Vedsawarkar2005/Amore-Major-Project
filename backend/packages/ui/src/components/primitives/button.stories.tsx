import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button.tsx";

const meta = {
  title: "Primitives/Button",
  component: Button,
  args: { children: "Add to bag" },
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Destructive: Story = { args: { children: "Delete", variant: "destructive" } };
export const Disabled: Story = { args: { disabled: true } };
