import React from 'react';
import { View, Text, ScrollView, Button, StyleSheet, SafeAreaView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import ExponeaButton from "@/src/components/ExponeaButton";

interface State {
    logs: string[];
    pushToken: string;
}

export default class NotificationScreen extends React.Component<{}, State> {
    state: State = {
        logs: [],
        pushToken: '',
    };

    addLog = (message: string) => {
        this.setState(prev => ({ logs: [...prev.logs, message] }));
    };

    getPushToken = async () => {
        // Placeholder method to be implemented later
        this.addLog('getPushToken called');
    };

    copyTokenToClipboard = async () => {
        if (this.state.pushToken) {
            await Clipboard.setStringAsync(this.state.pushToken);
            this.addLog('Token copied to clipboard!');
        } else {
            this.addLog('No token to copy. Fetch token first.');
        }
    };

    clearLogs = () => {
        this.setState({ logs: [] });
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {/* Console area */}
                <ScrollView style={styles.console} contentContainerStyle={{ padding: 10 }}>
                    {this.state.logs.map((log, index) => (
                        <Text key={index} style={styles.logText}>
                            {log}
                        </Text>
                    ))}
                </ScrollView>

                {/* Buttons area */}
                <View style={styles.buttonColumn}>
                    <View style={styles.buttonWrapper}>
                        <ExponeaButton title="Get Token" onPress={this.getPushToken} />
                    </View>
                    <View style={styles.buttonWrapper}>
                        <ExponeaButton title="Copy Token" onPress={this.copyTokenToClipboard} />
                    </View>
                    <View style={styles.buttonWrapper}>
                        <ExponeaButton title="Clear Logs" onPress={this.clearLogs} />
                    </View>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    console: { flex: 1, backgroundColor: '#222', margin: 0, borderRadius: 0 },
    logText: { color: '#fff', marginBottom: 4, fontFamily: 'monospace' },
    buttonColumn: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    buttonWrapper: {
        marginVertical: 8,
    },
});
