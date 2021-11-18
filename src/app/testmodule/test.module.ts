import { ElectronModule } from '../../library/decorators';
import { TestComponent } from './test.component';

@ElectronModule({
    bootstrap: TestComponent
})
export class TestModule { }