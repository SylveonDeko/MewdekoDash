
<script lang="ts">
    import Blockly, {WorkspaceSvg} from 'blockly';
    import {javascriptGenerator} from "blockly/javascript";
    import {createEventDispatcher} from "svelte";
    const dispatch = createEventDispatcher();
    let blocklyDiv: HTMLElement;
    let toolbox: HTMLElement
    let workspace: WorkspaceSvg;
    let code: string;
    $: {
        if (blocklyDiv && toolbox) {
            workspace = Blockly.inject(blocklyDiv, {
                toolbox: toolbox
            });
            workspace.addChangeListener(() => {
                computeCodeChanged();
            });
        }
    }
    function computeCodeChanged() {
        const newCode = javascriptGenerator.workspaceToCode(workspace)
        if (newCode !== code) {
            code = newCode
            dispatch('codeChanged', {code: newCode})
        }
    }
</script>
<div bind:this={blocklyDiv} class="h-full w-full text-left"/>
<xml bind:this={toolbox} style="display:none">
    <slot/>
</xml>