package com.exponea

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import io.mockk.every
import io.mockk.mockk
import io.mockk.spyk
import io.mockk.unmockkAll
import io.mockk.verify
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
internal class ExponeaModulePushTest {
    lateinit var module: ExponeaModule
    lateinit var context: ReactApplicationContext
    lateinit var eventEmmiter: DeviceEventManagerModule.RCTDeviceEventEmitter
    @Before
    fun before() {
        context = mockk()
        eventEmmiter = spyk()
        every { context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java) } returns eventEmmiter
        module = ExponeaModule(context)
    }

    @After
    fun after() {
        unmockkAll()
    }

    @Test
    fun `should save received push notification until listener is set`() {
        module.pushNotificationReceived(hashMapOf("data" to "value"))
        verify(exactly = 0) { eventEmmiter.emit(any(), any()) }
        module.onPushReceivedListenerSet(MockResolvingPromise {})
        verify { eventEmmiter.emit("pushReceived", """{"data":"value"}""") }
    }

    @Test
    fun `should save received push notification when listener is unset`() {
        module.onPushReceivedListenerSet(MockResolvingPromise {})
        module.pushNotificationReceived(hashMapOf("data" to "value"))
        verify(exactly = 1) { eventEmmiter.emit("pushReceived", """{"data":"value"}""") }
        module.onPushReceivedListenerRemove(MockResolvingPromise {})
        module.pushNotificationReceived(hashMapOf("data" to "value"))
        verify(exactly = 1) { eventEmmiter.emit("pushReceived", """{"data":"value"}""") }
        module.onPushReceivedListenerSet(MockResolvingPromise {})
        verify(exactly = 2) { eventEmmiter.emit("pushReceived", """{"data":"value"}""") }
    }

    @Test
    fun `should save opened push notification until listener is set`() {
        ExponeaModule.openPush(OpenedPush(PushAction.deeplink, "someUrl", hashMapOf("data" to "value")))
        verify(exactly = 0) { eventEmmiter.emit(any(), any()) }
        module.onPushOpenedListenerSet(MockResolvingPromise {})
        verify {
            eventEmmiter.emit(
                "pushOpened",
                """{"action":"deeplink","url":"someUrl","additionalData":{"data":"value"}}"""
            )
        }
    }

    @Test
    fun `should save opened push notification when listener is unset`() {
        module.onPushOpenedListenerSet(MockResolvingPromise {})
        ExponeaModule.openPush(OpenedPush(PushAction.deeplink, "someUrl", hashMapOf("data" to "value")))
        verify(exactly = 1) {
            eventEmmiter.emit(
                "pushOpened",
                """{"action":"deeplink","url":"someUrl","additionalData":{"data":"value"}}"""
            )
        }
        module.onPushOpenedListenerRemove(MockResolvingPromise {})
        ExponeaModule.openPush(OpenedPush(PushAction.deeplink, "someUrl", hashMapOf("data" to "value")))
        verify(exactly = 1) {
            eventEmmiter.emit(
                "pushOpened",
                """{"action":"deeplink","url":"someUrl","additionalData":{"data":"value"}}"""
            )
        }
        module.onPushOpenedListenerSet(MockResolvingPromise {})
        verify(exactly = 2) {
            eventEmmiter.emit(
                "pushOpened",
                """{"action":"deeplink","url":"someUrl","additionalData":{"data":"value"}}"""
            )
        }
    }
}
