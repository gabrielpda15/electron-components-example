import { ElectronModule } from '../library/decorators';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { TestModule } from './testmodule/test.module';

@ElectronModule({
    imports: [ TestModule ],
    declarations: [ HeaderComponent ],
    bootstrap: AppComponent
})
export class AppModule { }