import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import ExponeaButton from '../components/ExponeaButton';
import Exponea from "../../../lib";
import { NativeModules } from "react-native";
const { PushTokenModule } = NativeModules;

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
    setupCustomerId = async () => {
        let email = "emil@bloomreach.com"
        this.addLog('Setting up customer id with email: emil@bloomreach.com');
        let customerIds = {
            registered: email
        }
        let properties = {
            first_name: "Emil",
            last_name: "Markose",
            age: 35
        }
        Exponea.identifyCustomer(customerIds, properties).then(() => {
            this.addLog(`Customer identified successfully.`);
        }).catch(error => this.addLog(error.message))
    }
    getAuthorization = async () => {
        this.addLog('Checking notification permission');
        Exponea.requestPushAuthorization()
            .then(accepted => {
                this.addLog(`User has ${accepted ? 'accepted': 'rejected'} push notifications.`)
            })
            .catch(error => this.addLog(error.message))
    }
    getPushToken = async () => {
        this.addLog('Retrieving push token..');
        await PushTokenModule.getPushToken()
            .then((token: any) => {
                this.state.pushToken = token;
                this.addLog(`Push token: [${this.state.pushToken}]`);
            }).catch(() => this.addLog("Token not found"));
        await this.copyTokenToClipboard();
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
                    <ExponeaButton title="Request permission" onPress={this.getAuthorization} />
                    {/*<ExponeaButton title="Set customer id" onPress={this.setupCustomerId}/>*/}
                    <ExponeaButton title="Get Token" onPress={this.getPushToken}/>
                    <ExponeaButton title="Clear Logs" onPress={this.clearLogs}/>
                </View>
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff'},
    console: {flex: 1, backgroundColor: '#222', margin: 0, borderRadius: 0},
    logText: {color: '#fff', marginBottom: 4, fontFamily: 'monospace'},
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
