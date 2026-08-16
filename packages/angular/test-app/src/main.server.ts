import { Component, provideZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication, type BootstrapContext } from '@angular/platform-browser'
import { provideServerRendering } from '@angular/platform-server'

@Component({ selector: '[id=app]', template: '' })
class ServerBootstrap {}

export default (context: BootstrapContext) =>
  bootstrapApplication(
    ServerBootstrap,
    {
      providers: [provideServerRendering(), provideZonelessChangeDetection()],
    },
    context,
  )
