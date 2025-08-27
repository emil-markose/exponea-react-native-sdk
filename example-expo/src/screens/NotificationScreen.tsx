import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import ExponeaButton from '../components/ExponeaButton';
import Exponea from "../../../lib";

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
        console.log(message);
        this.setState(prev => ({ logs: [...prev.logs, message] }));
    };

    getAuthorization = async () => {
        this.addLog('Requesting authorization');
        Exponea.requestPushAuthorization()
            .then(accepted => {
                this.addLog(`User has ${accepted ? 'accepted': 'rejected'} push notifications.`)
            })
            .catch(error => this.addLog(error.message))
    }
    getPushToken = async () => {
        this.addLog('Retrieving push token..');
        this.addLog('Bridge not implemented. Failed to retrieve push token');
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
                <ScrollView style={styles.console} contentContainerStyle={{ padding: 10 }}>
                    {this.state.logs.map((log, index) => (
                        <Text key={index} style={styles.logText}>
                            {log}
                        </Text>
                    ))}
                </ScrollView>
                <View style={styles.buttonColumn}>
                    <ExponeaButton title="Request auth" onPress={this.getAuthorization} />
                    <ExponeaButton title="Get Token" onPress={this.getPushToken} />
                    <ExponeaButton title="Copy Token" onPress={this.copyTokenToClipboard} />
                    <ExponeaButton title="Clear Logs" onPress={this.clearLogs} />
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
