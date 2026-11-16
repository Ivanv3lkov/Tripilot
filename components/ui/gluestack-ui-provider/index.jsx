import React, { useEffect } from 'react';
import { View, Appearance } from 'react-native';
import { OverlayProvider } from '@gluestack-ui/core/overlay/creator';
import { ToastProvider } from '@gluestack-ui/core/toast/creator';

export function GluestackUIProvider({ mode = 'system', ...props }) {
  useEffect(() => {
    Appearance.setColorScheme(mode === 'system' ? null : mode);
  }, [mode]);

  return (
    <View style={[{ flex: 1, height: '100%', width: '100%' }, props.style]}>
      <OverlayProvider>
        <ToastProvider>{props.children}</ToastProvider>
      </OverlayProvider>
    </View>
  );
}
