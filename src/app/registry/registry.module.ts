import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegistryPage } from './registry.page';
import { RegistryPageRoutingModule } from './registry-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RegistryPageRoutingModule
  ],
  declarations: [RegistryPage]
})
export class RegistryPageModule {}
