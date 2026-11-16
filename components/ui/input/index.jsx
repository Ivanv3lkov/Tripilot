'use client';
import React from 'react';
import { createInput } from '@gluestack-ui/core/input/creator';
import { View, Pressable, TextInput } from 'react-native';
import { tva , withStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { styled } from 'nativewind';
import { UIIcon } from '@gluestack-ui/core/icon/creator';
const SCOPE = 'INPUT';
const StyledUIIcon = styled(UIIcon, { className: "style" });
const UIInput = createInput({
    Root: withStyleContext(View, SCOPE),
    Icon: StyledUIIcon,
    Slot: Pressable,
    Input: TextInput,
});
const inputStyle = tva({
    base: 'min-h-9 w-full flex-row items-center rounded-md border border-border  dark:bg-input/30 bg-transparent shadow-xs transition-[color,box-shadow] overflow-hidden data-[focus=true]:outline-none data-[focus=true]:border-ring dark:data-[focus=true]:border-ring data-[focus=true]:web:ring-[3px] data-[focus=true]:web:ring-ring/50 data-[invalid=true]:border-destructive/40 dark:data-[invalid=true]:border-destructive/40 data-[invalid=true]:web:ring-destructive/20 dark:data-[invalid=true]:web:ring-destructive/40 data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 px-3 gap-2',
});
const inputIconStyle = tva({
    base: 'justify-center items-center text-muted-foreground fill-none h-4 w-4',
});
const inputSlotStyle = tva({
    base: 'justify-center items-center web:disabled:cursor-not-allowed',
});
const inputFieldStyle = tva({
    base: 'flex-1 text-foreground text-sm md:text-sm py-1 h-full placeholder:text-muted-foreground  web:outline-none ios:leading-[0px] web:cursor-text web:data-[disabled=true]:cursor-not-allowed',
});
const Input = React.forwardRef(function Input({ className, ...props }, ref) {
    return (<UIInput ref={ref} {...props} className={inputStyle({ class: className })} context={{}}/>);
});
const InputIcon = React.forwardRef(function InputIcon({ className, ...props }, ref) {
    return (<UIInput.Icon ref={ref} {...props} className={inputIconStyle({ class: className })}/>);
});
const InputSlot = React.forwardRef(function InputSlot({ className, ...props }, ref) {
    return (<UIInput.Slot ref={ref} {...props} className={inputSlotStyle({
            class: className,
        })}/>);
});
const InputField = React.forwardRef(function InputField({ className, ...props }, ref) {
    return (<UIInput.Input ref={ref} {...props} className={inputFieldStyle({
            class: className,
        })}/>);
});
Input.displayName = 'Input';
InputIcon.displayName = 'InputIcon';
InputSlot.displayName = 'InputSlot';
InputField.displayName = 'InputField';
export { Input, InputField, InputIcon, InputSlot };
