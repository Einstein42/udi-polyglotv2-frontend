import { Component, OnInit, OnDestroy } from '@angular/core'
import { AuthService } from '../../services/auth.service'
import { SettingsService } from '../../services/settings.service'
import { WebsocketsService } from '../../services/websockets.service'
import { Router } from '@angular/router'
import { FlashMessagesService } from 'angular2-flash-messages'
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit, OnDestroy {

    public settingsForm: FormGroup
    private subSettings: any
    private subResponses: any

    constructor(
      private fb: FormBuilder,
      private sockets: WebsocketsService,
      private authService: AuthService,
      private router: Router,
      private flashMessage: FlashMessagesService,
      private settingsService: SettingsService
  ) {}

  ngOnInit() {
    this.settingsForm = this.fb.group({
      isyaddress: ['', Validators.required],
      isyport: [80, Validators.required],
      isyusername: ['', Validators.required],
      isypassword: '',
      isyhttps: false,
      mqttaddress: ['', Validators.required],
      mqttport: 1883,
      mqttwsport: 8083
    })
    this.getSettings()
    this.getSettingResponses()
  }

  ngOnDestroy() {
    if (this.subSettings) { this.subSettings.unsubscribe() }
    if (this.subResponses) { this.subResponses.unsubscribe() }
  }

  sendSettingsREST(settings) {
    this.settingsService.setSettings(settings).subscribe(data => {
      if (data.success) {
        this.flashMessage.show('Settings saved successfully.', {
          cssClass: 'alert-success',
          timeout: 5000})
        window.scrollTo(0, 0)
      } else {
        this.flashMessage.show(data.msg, {
          cssClass: 'alert-danger',
          timeout: 5000})
        window.scrollTo(0, 0)
      }
    })
  }

  getDirtyValues(cg) {
    const dirtyValues = {}
    Object.keys(cg.controls).forEach((c) => {
      const currentControl = cg.get(c)

      if (currentControl.dirty) {
        if (currentControl.controls) {
          dirtyValues[c] = this.getDirtyValues(currentControl)
        } else {
          dirtyValues[c] = currentControl.value
        }
      }
    })
    return dirtyValues
  }

  saveSettings(settings) {
    if (this.sockets.connected) {
      if (JSON.stringify(settings) !== '{}') {
        this.sockets.sendMessage('settings', {updatesettings: settings}, false, true)
      } else {
        this.flashMessage.show('No Settings Changed.', {
          cssClass: 'alert-danger',
          timeout: 5000})
        window.scrollTo(0, 0)
      }
    } else {
      this.sendSettingsREST(settings)
    }
  }

  getSettings() {
    this.subSettings = this.sockets.settingsData.subscribe(settings => {
      this.settingsForm.patchValue({
        isyaddress: settings.isyaddress,
        isyport: settings.isyport,
        isyusername: settings.isyusername,
        isyhttps: settings.isyhttps,
        mqttaddress: settings.mqttaddress,
        mqttport: settings.mqttport,
        mqttwsport: settings.mqttwsport
      })
    })
  }

  getSettingResponses() {
    this.subResponses = this.sockets.settingsResponse.subscribe(response => {
      if (response.hasOwnProperty('success')) {
        console.log(response)
        if (response.success) {
          this.flashMessage.show('Settings saved successfully.', {
            cssClass: 'alert-success',
            timeout: 5000})
          window.scrollTo(0, 0)
        } else {
          this.flashMessage.show(response.msg, {
            cssClass: 'alert-danger',
            timeout: 5000})
          window.scrollTo(0, 0)
        }
      }
    })
  }

}
