'use client';
import { Text, View } from 'react-native';
import React from 'react';
import { createFormControl } from '@gluestack-ui/core/form-control/creator';
import { tva , withStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { styled } from 'nativewind';
import { UIIcon } from '@gluestack-ui/core/icon/creator';
const SCOPE = 'FORM_CONTROL';
const formControlStyle = tva({
    base: 'flex flex-col',
});
const formControlErrorIconStyle = tva({
    base: 'text-destructive fill-none h-[18px] w-[18px]',
});
const formControlErrorStyle = tva({
    base: 'flex flex-row justify-start items-center mt-1 gap-1',
});
const formControlErrorTextStyle = tva({
    base: 'text-destructive text-xs font-body',
    variants: {
        isTruncated: {
            true: 'web:truncate',
        },
        bold: {
            true: 'font-bold',
        },
        underline: {
            true: 'underline',
        },
        strikeThrough: {
            true: 'line-through',
        },
        sub: {
            true: 'text-xs',
        },
        italic: {
            true: 'italic',
        },
        highlight: {
            true: 'bg-yellow-500',
        },
    },
});
const formControlHelperStyle = tva({
    base: 'flex flex-row justify-start items-center mt-1 font-body',
});
const formControlHelperTextStyle = tva({
    base: 'text-foreground/70 font-body text-sm',
    variants: {
        isTruncated: {
            true: 'web:truncate',
        },
        bold: {
            true: 'font-bold',
        },
        underline: {
            true: 'underline',
        },
        strikeThrough: {
            true: 'line-through',
        },
        sub: {
            true: 'text-xs',
        },
        italic: {
            true: 'italic',
        },
        highlight: {
            true: 'bg-yellow-500',
        },
    },
});
const formControlLabelStyle = tva({
    base: 'flex flex-row justify-start items-center mb-1',
});
const formControlLabelTextStyle = tva({
    base: 'font-medium text-foreground text-base font-body',
    variants: {
        isTruncated: {
            true: 'web:truncate',
        },
        bold: {
            true: 'font-bold',
        },
        underline: {
            true: 'underline',
        },
        strikeThrough: {
            true: 'line-through',
        },
        sub: {
            true: 'text-xs',
        },
        italic: {
            true: 'italic',
        },
        highlight: {
            true: 'bg-yellow-500',
        },
    },
});
const formControlLabelAstrickStyle = tva({
    base: 'font-medium text-foreground text-base',
    variants: {
        isTruncated: {
            true: 'web:truncate',
        },
        bold: {
            true: 'font-bold',
        },
        underline: {
            true: 'underline',
        },
        strikeThrough: {
            true: 'line-through',
        },
        sub: {
            true: 'text-xs',
        },
        italic: {
            true: 'italic',
        },
        highlight: {
            true: 'bg-yellow-500',
        },
    },
});
const FormControlLabelAstrick = React.forwardRef(function FormControlLabelAstrick({ className, ...props }, ref) {
    return (<Text ref={ref} className={formControlLabelAstrickStyle({
            class: className,
        })} {...props}/>);
});
const StyledUIIcon = styled(UIIcon, { className: "style" });
export const UIFormControl = createFormControl({
    Root: withStyleContext(View, SCOPE),
    Error: View,
    ErrorText: Text,
    ErrorIcon: StyledUIIcon,
    Label: View,
    LabelText: Text,
    LabelAstrick: FormControlLabelAstrick,
    Helper: View,
    HelperText: Text,
});
const FormControl = React.forwardRef(function FormControl({ className, ...props }, ref) {
    return (<UIFormControl ref={ref} className={formControlStyle({ class: className })} {...props}/>);
});
const FormControlError = React.forwardRef(function FormControlError({ className, ...props }, ref) {
    return (<UIFormControl.Error ref={ref} className={formControlErrorStyle({ class: className })} {...props}/>);
});
const FormControlErrorText = React.forwardRef(function FormControlErrorText({ className, ...props }, ref) {
    return (<UIFormControl.Error.Text className={formControlErrorTextStyle({
            class: className,
        })} ref={ref} {...props}/>);
});
const FormControlErrorIcon = React.forwardRef(function FormControlErrorIcon({ className, ...props }, ref) {
    return (<UIFormControl.Error.Icon ref={ref} {...props} className={formControlErrorIconStyle({ class: className })}/>);
});
const FormControlLabel = React.forwardRef(function FormControlLabel({ className, ...props }, ref) {
    return (<UIFormControl.Label ref={ref} className={formControlLabelStyle({ class: className })} {...props}/>);
});
const FormControlLabelText = React.forwardRef(function FormControlLabelText({ className, ...props }, ref) {
    return (<UIFormControl.Label.Text className={formControlLabelTextStyle({
            class: className,
        })} ref={ref} {...props}/>);
});
const FormControlHelper = React.forwardRef(function FormControlHelper({ className, ...props }, ref) {
    return (<UIFormControl.Helper ref={ref} className={formControlHelperStyle({
            class: className,
        })} {...props}/>);
});
const FormControlHelperText = React.forwardRef(function FormControlHelperText({ className, ...props }, ref) {
    return (<UIFormControl.Helper.Text className={formControlHelperTextStyle({
            class: className,
        })} ref={ref} {...props}/>);
});
FormControl.displayName = 'FormControl';
FormControlError.displayName = 'FormControlError';
FormControlErrorText.displayName = 'FormControlErrorText';
FormControlErrorIcon.displayName = 'FormControlErrorIcon';
FormControlLabel.displayName = 'FormControlLabel';
FormControlLabelText.displayName = 'FormControlLabelText';
FormControlLabelAstrick.displayName = 'FormControlLabelAstrick';
FormControlHelper.displayName = 'FormControlHelper';
FormControlHelperText.displayName = 'FormControlHelperText';
export { FormControl, FormControlError, FormControlErrorText, FormControlErrorIcon, FormControlLabel, FormControlLabelText, FormControlLabelAstrick, FormControlHelper, FormControlHelperText, };
