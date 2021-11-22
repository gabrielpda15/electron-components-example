import { Module } from '../../library/decorators';
import { TestComponent } from './test.component';

@Module({
    bootstrap: TestComponent
})
export class TestModule { }