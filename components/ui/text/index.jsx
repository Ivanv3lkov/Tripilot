import React from 'react';
import { Text as RNText } from 'react-native';
import { textStyle } from './styles';
const Text = React.forwardRef(function Text({ className, isTruncated, bold, underline, strikeThrough, size = 'md', sub, italic, highlight, ...props }, ref) {
    return (<RNText className={textStyle({
            isTruncated: isTruncated,
            bold: bold,
            underline: underline,
            strikeThrough: strikeThrough,
            size,
            sub: sub,
            italic: italic,
            highlight: highlight,
            class: className,
        })} {...props} ref={ref}/>);
});
Text.displayName = 'Text';
export { Text };
