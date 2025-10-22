export interface ButtonProps
{
   value: string;
   onClickCallback?: () => Promise<void> | void;
   customColor?: { 
      button?: string;
      label?: string;
   };
   icon?: {
      name: string;
      iconStyle?: string;
   };
}