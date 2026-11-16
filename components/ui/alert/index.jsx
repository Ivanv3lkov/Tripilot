'use client';
import { createAlert } from '@gluestack-ui/core/alert/creator';
import { UIIcon } from '@gluestack-ui/core/icon/creator';
import { tva, useStyleContext, withStyleContext } from '@gluestack-ui/utils/nativewind-utils';
import { styled } from 'nativewind';
import React from 'react';
import { Text, View } from 'react-native';
const SCOPE = 'ALERT';
const alertStyle = tva({
    base: 'rounded-lg border px-2.5 py-2 flex-row gap-2 items-start ',
    variants: {
        variant: {
            default: 'bg-card border-border',
            destructive: 'bg-card border-destructive',
        },
    },
});
const alertTextStyle = tva({
    base: 'font-medium tracking-tight text-sm flex-1',
    parentVariants: {
        variant: {
            default: 'text-card-foreground',
            destructive: 'text-destructive',
        },
    },
});
const alertIconStyle = tva({
    base: 'fill-none w-4 h-4 mt-0.5',
    parentVariants: {
        variant: {
            default: 'text-card-foreground',
            destructive: 'text-destructive',
        },
    },
});
const StyledUIIcon = styled(UIIcon, {
    className: "style",
});
export const UIAlert = createAlert({
    Root: withStyleContext(View, SCOPE),
    Text: Text,
    Icon: StyledUIIcon,
});
const Alert = React.forwardRef(function Alert({ className, variant = 'default', ...props }, ref) {
    return (<UIAlert className={alertStyle({ variant, class: className })} context={{ variant }} ref={ref} {...props}/>);
});
const AlertText = React.forwardRef(function AlertText({ className, ...props }, ref) {
    const { variant: parentVariant } = useStyleContext(SCOPE);
    return (<UIAlert.Text className={alertTextStyle({
            class: className,
            parentVariants: {
                variant: parentVariant,
            },
        })} {...props} ref={ref}/>);
});
const AlertIcon = React.forwardRef(function AlertIcon({ className, ...props }, ref) {
    const { variant: parentVariant } = useStyleContext(SCOPE);
    return (<UIAlert.Icon className={alertIconStyle({
            parentVariants: {
                variant: parentVariant,
            },
            class: className,
        })} {...props} ref={ref}/>);
});
Alert.displayName = 'Alert';
AlertText.displayName = 'AlertText';
AlertIcon.displayName = 'AlertIcon';
export { Alert, AlertIcon, AlertText };
