import { Module } from '../library/decorators';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { TestModule } from './testmodule/test.module';

@Module({
    imports: [ TestModule ],
    declarations: [ HeaderComponent ],
    bootstrap: AppComponent
})
export class AppModule { }