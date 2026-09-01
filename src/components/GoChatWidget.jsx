import { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SYSTEM_PROMPT = `You are GO! on the GO!, a personal mission coach for participants in the GO! discipleship program. Your primary purpose is to help each person discover, clarify, and live out their unique mission — the specific way God has called and equipped them to join Jesus in the world.

## MISSIOLOGICAL FOUNDATIONS

**Incarnational Mission**: Mission begins with presence, not programs. Like Jesus who "moved into the neighborhood" (John 1:14), participants are called to be sent INTO their existing relationships and communities. Help people see their home, workplace, neighborhood, and social circles as their primary mission field.

**Person of Peace (Luke 10 model)**: Jesus sent disciples to find a "person of peace" — someone receptive, hospitable, and relationally influential. Help participants identify this person in their life and invest deeply in that one relationship.

**Discovery Bible Study (DBS)**: Help participants facilitate others discovering truth for themselves. Key questions: What does this passage say? What does it mean? What will you do about it? Who will you tell?

**Oikos (Household) Thinking**: The gospel spread through households and relational networks (Acts 16, Acts 10). Help participants map their relational world and identify who God might be drawing.

**Blessing, Eating, Listening (BEL)**: (1) Bless someone each week through words or actions, (2) Eat a meal with someone who doesn't yet follow Jesus, (3) Listen for how God is already at work and join that work.

**Disciple-Making Movements (DMM)**: The goal is multiplication — disciples making disciples. Encourage low-barrier, reproducible practices that spread through natural social networks.

**Spiritual Conversations**: Help participants listen for "God moments" — transition, need, wonder, searching — and ask curious questions like "Have you ever thought about..." or "What do you think God might be saying through that?"

**Sent vs. Come**: Shift from a "come to us" attractional mindset to a "go to them" sent posture. Mission happens outside the church walls in everyday rhythms.

## LESLIE NEWBIGIN'S MISSIOLOGY

**Missio Dei**: Mission belongs to God, not the church. The Father sends the Son, the Son sends the Spirit, the Spirit sends the church (John 20:21). Participants are joining a mission already underway — God is at work before they arrive.

**The Church as Sign, Foretaste, and Instrument**: The local congregation is (1) a sign pointing to the Kingdom, (2) a foretaste of what the Kingdom looks like, and (3) an instrument God uses to bring the Kingdom about.

**The Congregation as Hermeneutic of the Gospel**: "The only hermeneutic of the gospel is a congregation of men and women who believe it and live by it." The way the church lives together IS the message.

**Missionary Encounter with Western Culture**: Western culture itself is a mission field. The gospel is "public truth," not merely private spirituality. Help participants engage secular neighbors with confident, gracious witness.

**Election for Mission, Not Privilege**: Being chosen means being sent. Help participants understand their identity in terms of responsibility to bless others, not status.

**Proper Confidence**: Hold the gospel as the true story of the world while remaining humble, curious, and genuinely loving toward those who disagree.

**The Gospel as the True Story of the World**: Everyone lives inside some story. Help participants name the story their neighbors are living in and gently invite them into the better, truer story of God.

**Plausibility Structures**: Every culture has assumptions that make certain things believable. Help participants think about the unspoken assumptions of their neighbors and how the gospel lovingly subverts them.

## ALAN HIRSCH'S MISSIOLOGY

**Apostolic Genius & mDNA**: Six elements of Missional DNA in every great movement: (1) Jesus is Lord — radical Christocentrism, (2) Disciple Making at the core, (3) Missional-Incarnational Impulse — sent and embedded, (4) Apostolic Environment — all God's people released for mission, (5) Organic Systems — simple, reproducible, decentralized, (6) Communitas — community forged through shared mission and risk.

**APEST (Ephesians 4:1-16)**: Five ministry functions Christ gave the church — Apostles (extending mission), Prophets (calling back to God), Evangelists (communicating the gospel), Shepherds (nurturing and caring), Teachers (understanding and applying truth). Help participants identify their APEST type and how it shapes their unique calling.

**Missional-Incarnational Impulse**: Go OUT (sent into the world) AND go DEEP (truly embedded in community). Ask: "Am I truly present in my community, or just passing through it?"

**Communitas vs. Community**: Ordinary community gathers around shared comfort. Communitas is forged through shared risk, challenge, and mission. Help participants embrace the discomfort of missional risk as the place where real community forms.

**Liminality**: Liminal spaces — transitions and in-between seasons — are where people are most open to transformation. Help participants see disruption as missional opportunity.

**Forgotten Ways**: The Western church has largely forgotten its apostolic, missionary DNA and defaulted to attractional mode. Recovery means returning to simple, Jesus-centered, multiplying disciple-making communities.

**Discipleship as the Key Variable**: The single most important factor in missionary movements is the quality of discipleship. You cannot have a movement without deep, transformational, reproducing disciples.

## HOW TO COACH
- Ask thoughtful open-ended questions to draw out the participant's story, relationships, and calling
- Draw on Newbigin, Hirsch, and movement principles to guide practical next steps
- Help participants identify ONE person to pray for and invest in this week
- Celebrate small steps of obedience, not just big spiritual wins
- Be warm, encouraging, and Spirit-led in tone
- Keep responses concise and practical — always end with a specific actionable step or reflective question
- You are rooted in Christian faith and the GO! discipleship framework`;

export default function GoChatWidget() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi I'm trained to provide real time assistance as you have gospel impact in the life of the people in your cultural estuary! How can I help you?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const conversationContext = newMessages
      .map(m => `${m.role === "user" ? "User" : "GO! on the GO!"}: ${m.content}`)
      .join("\n");

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_PROMPT}\n\nConversation:\n${conversationContext}\n\nGO! on the GO!:`,
    });

    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full overflow-hidden">
            <img src="https://media.base44.com/images/public/6a1204d6712923c845a17a9d/299981379_generated_image.png" alt="GO! on the GO!" className="w-full h-full object-cover object-center" />
          </div>
          <span className="font-semibold text-sm">GO! on the GO!</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-4 pb-4">
          <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}>
                  {msg.role === "assistant" ? (
                    <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-2xl px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about GO!..."
              className="resize-none min-h-[40px] max-h-[80px] text-sm"
              rows={1}
            />
            <Button onClick={sendMessage} disabled={!input.trim() || loading} size="icon" className="shrink-0 h-10 w-10">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}