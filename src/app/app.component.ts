import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavBarComponent } from './_components/nav-bar/nav-bar.component';
import { ModalComponent } from "./_components/modal/modal.component";
import { SettingsComponent } from "./_components/settings/settings.component";
import { HyperlinkEditorComponent } from "./_components/hyperlink-editor/hyperlink-editor.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavBarComponent, ModalComponent, SettingsComponent, HyperlinkEditorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'genshin-site';
}
